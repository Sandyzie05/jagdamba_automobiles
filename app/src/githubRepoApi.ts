export interface GithubRepoSettings {
  owner: string
  repo: string
  branch: string
  token: string
}

export interface GithubUpsertFile {
  path: string
  content: string
  message: string
}

export interface GithubBinaryUpload {
  path: string
  file: File
  message: string
}

export interface GithubAdminAccess {
  login: string
  canWrite: boolean
}

const apiBase = 'https://api.github.com'

const cleanPath = (path: string) => path.replace(/^\/+/, '').replace(/\\/g, '/')
const encodeRepoPath = (path: string) => cleanPath(path).split('/').map(encodeURIComponent).join('/')

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
})

const toBase64 = async (file: File) => {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  const chunks: string[] = []

  for (let index = 0; index < bytes.length; index += chunkSize) {
    chunks.push(String.fromCharCode(...bytes.subarray(index, index + chunkSize)))
  }

  return btoa(chunks.join(''))
}

const textToBase64 = (text: string) => btoa(unescape(encodeURIComponent(text)))

const getFileSha = async (settings: GithubRepoSettings, path: string) => {
  const response = await fetch(
    `${apiBase}/repos/${settings.owner}/${settings.repo}/contents/${encodeRepoPath(path)}?ref=${encodeURIComponent(settings.branch)}`,
    {
      headers: authHeaders(settings.token),
    },
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`GitHub lookup failed for ${path}`)
  }

  const payload = (await response.json()) as { sha?: string }
  return payload.sha ?? null
}

export const upsertGithubTextFile = async (settings: GithubRepoSettings, file: GithubUpsertFile) => {
  const sha = await getFileSha(settings, file.path)
  const response = await fetch(
    `${apiBase}/repos/${settings.owner}/${settings.repo}/contents/${encodeRepoPath(file.path)}`,
    {
      method: 'PUT',
      headers: {
        ...authHeaders(settings.token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: file.message,
        content: textToBase64(file.content),
        branch: settings.branch,
        ...(sha ? { sha } : {}),
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`GitHub publish failed for ${file.path}`)
  }

  return response.json()
}

export const upsertGithubBinaryFile = async (settings: GithubRepoSettings, file: GithubBinaryUpload) => {
  const sha = await getFileSha(settings, file.path)
  const response = await fetch(
    `${apiBase}/repos/${settings.owner}/${settings.repo}/contents/${encodeRepoPath(file.path)}`,
    {
      method: 'PUT',
      headers: {
        ...authHeaders(settings.token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: file.message,
        content: await toBase64(file.file),
        branch: settings.branch,
        ...(sha ? { sha } : {}),
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`GitHub upload failed for ${file.path}`)
  }

  return response.json()
}

export const deleteGithubFile = async (
  settings: GithubRepoSettings,
  path: string,
  message: string,
) => {
  const sha = await getFileSha(settings, path)
  if (!sha) {
    return null
  }

  const response = await fetch(
    `${apiBase}/repos/${settings.owner}/${settings.repo}/contents/${encodeRepoPath(path)}`,
    {
      method: 'DELETE',
      headers: {
        ...authHeaders(settings.token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        branch: settings.branch,
        sha,
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`GitHub delete failed for ${path}`)
  }

  return response.json()
}

export const publishInventoryBundle = async (
  settings: GithubRepoSettings,
  inventoryJson: string,
  inventoryFilePaths: string[],
  imageUploads: GithubBinaryUpload[],
) => {
  for (const path of inventoryFilePaths) {
    await upsertGithubTextFile(settings, {
      path,
      content: inventoryJson,
      message: `Update inventory data: ${path}`,
    })
  }

  for (const upload of imageUploads) {
    await upsertGithubBinaryFile(settings, upload)
  }
}

export const validateGithubAdminAccess = async (
  settings: GithubRepoSettings,
): Promise<GithubAdminAccess> => {
  const userResponse = await fetch(`${apiBase}/user`, {
    headers: authHeaders(settings.token),
  })

  if (!userResponse.ok) {
    throw new Error('Could not verify this GitHub token.')
  }

  const userPayload = (await userResponse.json()) as { login?: string }
  const login = userPayload.login?.trim()
  if (!login) {
    throw new Error('GitHub user could not be identified.')
  }

  const repoResponse = await fetch(`${apiBase}/repos/${settings.owner}/${settings.repo}`, {
    headers: authHeaders(settings.token),
  })

  if (!repoResponse.ok) {
    throw new Error('Could not verify repository access for this token.')
  }

  const repoPayload = (await repoResponse.json()) as {
    owner?: { login?: string }
    permissions?: { admin?: boolean; maintain?: boolean; push?: boolean }
  }

  const isOwner = repoPayload.owner?.login?.toLowerCase() === login.toLowerCase()
  const permissions = repoPayload.permissions
  const canWrite = Boolean(isOwner || permissions?.admin || permissions?.maintain || permissions?.push)

  if (!canWrite) {
    throw new Error('This GitHub user does not have write access to the repository.')
  }

  return { login, canWrite }
}
