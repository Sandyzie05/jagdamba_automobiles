import { useEffect, useMemo, useState } from 'react'
import {
  createInventoryItem,
  inventoryCategories,
  type InventoryCategory,
  type InventoryDraftItem,
  type InventoryItem,
  inventoryImagePath,
  isRemoteAsset,
  loadInventory,
  normalizeInventoryDocument,
  normalizeInventoryItem,
  resolveInventoryImage,
  serializeInventoryDocument,
} from './inventory'
import {
  deleteGithubFile,
  publishInventoryBundle,
  type GithubRepoSettings,
  validateGithubAdminAccess,
} from './githubRepoApi'

type DraftStatus = 'idle' | 'loading' | 'publishing' | 'saved' | 'error'

const STORAGE_KEY = 'jagdamba-admin-inventory'
const SETTINGS_KEY = 'jagdamba-admin-github-settings'
const TOKEN_KEY = 'jagdamba-admin-token'
const ACCESS_KEY = 'jagdamba-admin-authorized-user'

const defaultSettings = (): GithubRepoSettings => ({
  owner: 'Sandyzie05',
  repo: 'jagdamba_automobiles',
  branch: 'main',
  token: '',
})

const readStoredInventory = async () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return normalizeInventoryDocument(JSON.parse(stored) as unknown)
  }

  return loadInventory()
}

const readStoredSettings = (): GithubRepoSettings => {
  const stored = localStorage.getItem(SETTINGS_KEY)
  const token = sessionStorage.getItem(TOKEN_KEY) ?? ''
  if (!stored) {
    return { ...defaultSettings(), token }
  }

  try {
    const parsed = JSON.parse(stored) as Partial<GithubRepoSettings>
    return {
      ...defaultSettings(),
      owner: parsed.owner?.trim() || defaultSettings().owner,
      repo: parsed.repo?.trim() || defaultSettings().repo,
      branch: parsed.branch?.trim() || defaultSettings().branch,
      token,
    }
  } catch {
    return { ...defaultSettings(), token }
  }
}

const saveDraftInventory = (items: InventoryItem[]) => {
  localStorage.setItem(
    STORAGE_KEY,
    serializeInventoryDocument({
      version: 1,
      shopName: 'Jagdamba Automobiles',
      currency: 'INR',
      updatedAt: new Date().toISOString(),
      items,
    }),
  )
}

const toInventoryItems = (items: InventoryDraftItem[]): InventoryItem[] =>
  items.map((item) => normalizeInventoryItem(item))

const downloadJson = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

const fileNameFromPath = (path: string) => {
  const segments = path.split('/')
  return segments[segments.length - 1] ?? 'image'
}

const imagePreviewSrc = (item: InventoryDraftItem) => {
  if (item.draftImagePreviewUrl) {
    return item.draftImagePreviewUrl
  }

  return resolveInventoryImage(item.imagePath)
}

function AdminPage() {
  const [status, setStatus] = useState<DraftStatus>('loading')
  const [message, setMessage] = useState('Loading inventory...')
  const [inventory, setInventory] = useState<InventoryDraftItem[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [settings, setSettings] = useState<GithubRepoSettings>(defaultSettings())
  const [importError, setImportError] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authorizedUser, setAuthorizedUser] = useState('')

  useEffect(() => {
    const storedSettings = readStoredSettings()
    setSettings(storedSettings)
    const storedAuthorizedUser = sessionStorage.getItem(ACCESS_KEY) ?? ''
    if (storedAuthorizedUser && storedSettings.token.trim()) {
      setIsAuthorized(true)
      setAuthorizedUser(storedAuthorizedUser)
    }

    readStoredInventory()
      .then((document) => {
        setInventory(document.items)
        setSelectedId(document.items[0]?.id ?? '')
        setStatus('idle')
        setMessage('Inventory ready')
      })
      .catch((error) => {
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Unable to load inventory')
      })
  }, [])

  useEffect(() => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        owner: settings.owner,
        repo: settings.repo,
        branch: settings.branch,
      }),
    )
    sessionStorage.setItem(TOKEN_KEY, settings.token)
  }, [settings])

  useEffect(() => {
    if (status === 'idle' || status === 'saved') {
      saveDraftInventory(toInventoryItems(inventory))
    }
  }, [inventory, status])

  const selectedItem = useMemo<InventoryDraftItem | undefined>(
    () => inventory.find((item) => item.id === selectedId),
    [inventory, selectedId],
  )

  const updateItem = (id: string, patch: Partial<InventoryDraftItem>) => {
    setInventory((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...patch,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    )
  }

  const addItem = () => {
    const item = createInventoryItem({ name: 'New inventory item' })
    setInventory((current) => [{ ...item }, ...current])
    setSelectedId(item.id)
    setMessage('New item added')
  }

  const removeItem = (id: string) => {
    setInventory((current) => {
      const next = current.filter((item) => item.id !== id)
      setSelectedId((currentSelected) => (currentSelected === id ? next[0]?.id ?? '' : currentSelected))
      return next
    })
  }

  const handleImport = async (file: File) => {
    setImportError('')
    try {
      const text = await file.text()
      const parsed = normalizeInventoryDocument(JSON.parse(text) as unknown)
      setInventory(parsed.items)
      setSelectedId(parsed.items[0]?.id ?? '')
      setMessage('Inventory imported')
      setStatus('saved')
    } catch {
      setImportError('Could not import that file. Please use a valid inventory JSON export.')
    }
  }

  const handleExport = () => {
    const document = normalizeInventoryDocument({
      version: 1,
      shopName: 'Jagdamba Automobiles',
      currency: 'INR',
      updatedAt: new Date().toISOString(),
      items: toInventoryItems(inventory),
    })

    downloadJson(`jagdamba-inventory-${new Date().toISOString().slice(0, 10)}.json`, serializeInventoryDocument(document))
  }

  const handlePublish = async () => {
    if (!settings.token.trim()) {
      setStatus('error')
      setMessage('Add a GitHub token before publishing.')
      return
    }

    setStatus('publishing')
    setMessage('Publishing inventory to GitHub...')

    try {
      const document = normalizeInventoryDocument({
        version: 1,
        shopName: 'Jagdamba Automobiles',
        currency: 'INR',
        updatedAt: new Date().toISOString(),
        items: toInventoryItems(inventory).map((item) => ({
          ...item,
          imagePath:
            inventory.find((draftItem) => draftItem.id === item.id)?.draftImageFile &&
            !isRemoteAsset(item.imagePath)
              ? inventoryImagePath(
                  item.id,
                  inventory.find((draftItem) => draftItem.id === item.id)?.draftImageFile?.name ?? item.imagePath,
                )
              : item.imagePath,
        })),
      })

      const imageUploads = inventory.flatMap((item) =>
        item.draftImageFile
          ? [
              {
                itemId: item.id,
                file: item.draftImageFile,
                path: inventoryImagePath(item.id, item.draftImageFile.name),
              },
            ]
          : [],
      )

      const siteInventoryFile = 'www/data/inventory.json'
      const sourceInventoryFile = 'app/public/data/inventory.json'

      const imagePathsForGithub = imageUploads.flatMap((upload) => [
        {
          path: `app/public/${upload.path}`,
          file: upload.file,
          message: `Upload inventory image for ${upload.itemId} (source)`,
        },
        {
          path: `www/${upload.path}`,
          file: upload.file,
          message: `Upload inventory image for ${upload.itemId} (site)`,
        },
      ])

      await publishInventoryBundle(
        settings,
        serializeInventoryDocument(document),
        [sourceInventoryFile, siteInventoryFile],
        imagePathsForGithub,
      )

      setInventory(document.items.map((item) => ({ ...item })))
      setStatus('saved')
      setMessage('Inventory published to GitHub')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Publish failed')
    }
  }

  const deleteOrphanImage = async (item: InventoryDraftItem) => {
    if (!settings.token.trim() || isRemoteAsset(item.imagePath) || !item.imagePath.startsWith('images/inventory/')) {
      return
    }

    try {
      await deleteGithubFile(settings, `app/public/${item.imagePath}`, `Remove inventory image: ${item.name}`)
      await deleteGithubFile(settings, `www/${item.imagePath}`, `Remove inventory image: ${item.name}`)
    } catch {
      // Swallow delete errors; item removal should still succeed.
    }
  }

  const uploadFile = (file: File | null, id: string) => {
    if (!file) {
      updateItem(id, {
        draftImageFile: null,
        draftImagePreviewUrl: undefined,
      })
      return
    }

    const previewUrl = URL.createObjectURL(file)
    updateItem(id, {
      draftImageFile: file,
      draftImagePreviewUrl: previewUrl,
      imagePath: file.name,
    })
  }

  const currentFile = selectedItem?.draftImageFile ?? null

  const handleUnlock = async () => {
    if (!settings.token.trim()) {
      setStatus('error')
      setMessage('Add a GitHub token with repository write access.')
      return
    }

    setStatus('publishing')
    setMessage('Verifying admin access...')

    try {
      const access = await validateGithubAdminAccess(settings)
      sessionStorage.setItem(ACCESS_KEY, access.login)
      setIsAuthorized(true)
      setAuthorizedUser(access.login)
      setStatus('idle')
      setMessage(`Admin access granted for ${access.login}`)
    } catch (error) {
      setIsAuthorized(false)
      setAuthorizedUser('')
      sessionStorage.removeItem(ACCESS_KEY)
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Admin verification failed')
    }
  }

  const handleSignOut = () => {
    setIsAuthorized(false)
    setAuthorizedUser('')
    sessionStorage.removeItem(ACCESS_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    setSettings((current) => ({ ...current, token: '' }))
    setStatus('idle')
    setMessage('Admin session closed')
  }

  if (!isAuthorized) {
    return (
      <div className="admin-shell" style={adminStyles.shell}>
        <style>{adminCss}</style>
        <div style={adminStyles.authWrap}>
          <section style={adminStyles.authCard}>
            <p style={adminStyles.kicker}>Admin access</p>
            <h1 style={adminStyles.title}>Sign in as a repository admin</h1>
            <p style={adminStyles.subtitle}>
              This admin page is locked. Enter a GitHub personal access token that has write access
              to this repository to open inventory management.
            </p>

            <div style={adminStyles.authGrid}>
              <label style={adminStyles.field}>
                <span>GitHub owner</span>
                <input
                  value={settings.owner}
                  onChange={(event) => setSettings((current) => ({ ...current, owner: event.target.value }))}
                  placeholder="Sandyzie05"
                />
              </label>
              <label style={adminStyles.field}>
                <span>Repository</span>
                <input
                  value={settings.repo}
                  onChange={(event) => setSettings((current) => ({ ...current, repo: event.target.value }))}
                  placeholder="jagdamba_automobiles"
                />
              </label>
              <label style={adminStyles.field}>
                <span>Branch</span>
                <input
                  value={settings.branch}
                  onChange={(event) => setSettings((current) => ({ ...current, branch: event.target.value }))}
                  placeholder="main"
                />
              </label>
              <label style={{ ...adminStyles.field, gridColumn: '1 / -1' }}>
                <span>GitHub PAT</span>
                <input
                  value={settings.token}
                  onChange={(event) => setSettings((current) => ({ ...current, token: event.target.value }))}
                  placeholder="github personal access token with contents write access"
                  type="password"
                />
              </label>
            </div>

            <div style={adminStyles.authActions}>
              <button
                style={adminStyles.primaryButton}
                onClick={() => {
                  void handleUnlock()
                }}
                type="button"
              >
                Unlock admin
              </button>
              <a style={adminStyles.secondaryButton} href={`${import.meta.env.BASE_URL}`}>
                Back to website
              </a>
            </div>

            <p style={adminStyles.helperText}>
              Static GitHub Pages cannot fully hide the URL, but the editor itself stays locked
              unless the GitHub user has write access to this repository.
            </p>
            <p style={status === 'error' ? adminStyles.errorText : adminStyles.helperText}>{message}</p>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-shell" style={adminStyles.shell}>
      <style>{adminCss}</style>
      <header style={adminStyles.header}>
        <div>
          <p style={adminStyles.kicker}>Admin</p>
          <h1 style={adminStyles.title}>Jagdamba inventory manager</h1>
          <p style={adminStyles.subtitle}>
            Manage products locally, export JSON, and publish to GitHub Pages without a database.
            {authorizedUser ? ` Signed in as ${authorizedUser}.` : ''}
          </p>
        </div>
        <div style={adminStyles.headerActions}>
          <button style={adminStyles.primaryButton} onClick={addItem} type="button">
            Add item
          </button>
          <button style={adminStyles.secondaryButton} onClick={handleExport} type="button">
            Export JSON
          </button>
          <label style={adminStyles.secondaryButton}>
            Import JSON
            <input
              type="file"
              accept="application/json"
              style={adminStyles.hiddenInput}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  void handleImport(file)
                }
              }}
            />
          </label>
          <button style={adminStyles.primaryButton} onClick={handlePublish} type="button">
            Publish
          </button>
          <button style={adminStyles.secondaryButton} onClick={handleSignOut} type="button">
            Sign out
          </button>
        </div>
      </header>

      <section className="settings-panel" style={adminStyles.settingsPanel}>
        <label style={adminStyles.field}>
          <span>GitHub owner</span>
          <input
            value={settings.owner}
            onChange={(event) => setSettings((current) => ({ ...current, owner: event.target.value }))}
            placeholder="Sandyzie05"
          />
        </label>
        <label style={adminStyles.field}>
          <span>Repository</span>
          <input
            value={settings.repo}
            onChange={(event) => setSettings((current) => ({ ...current, repo: event.target.value }))}
            placeholder="jagdamba_automobiles"
          />
        </label>
        <label style={adminStyles.field}>
          <span>Branch</span>
          <input
            value={settings.branch}
            onChange={(event) => setSettings((current) => ({ ...current, branch: event.target.value }))}
            placeholder="main"
          />
        </label>
        <label style={adminStyles.field}>
          <span>PAT</span>
          <input
            value={settings.token}
            onChange={(event) => setSettings((current) => ({ ...current, token: event.target.value }))}
            placeholder="github personal access token"
            type="password"
          />
        </label>
      </section>

      <section className="content" style={adminStyles.content}>
        <aside style={adminStyles.sidebar}>
          <div style={adminStyles.sidebarHeader}>
            <strong>Items</strong>
            <span>{inventory.length}</span>
          </div>
          <div style={adminStyles.itemList}>
            {inventory.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                style={{
                  ...adminStyles.itemButton,
                  ...(selectedId === item.id ? adminStyles.itemButtonActive : {}),
                }}
              >
                <img src={imagePreviewSrc(item)} alt="" style={adminStyles.thumb} />
                <div style={adminStyles.itemButtonText}>
                  <strong>{item.name}</strong>
                  <span>{item.category}</span>
                </div>
                <span
                  style={{
                    ...adminStyles.statusDot,
                    background: item.featured ? '#ec4648' : '#d7d2c8',
                  }}
                />
              </button>
            ))}
          </div>
        </aside>

        <main style={adminStyles.editor}>
          {selectedItem ? (
            <>
              <section style={adminStyles.editorCard}>
                <div style={adminStyles.cardHeader}>
                  <div>
                    <p style={adminStyles.kicker}>Edit item</p>
                    <h2 style={adminStyles.sectionTitle}>{selectedItem.name}</h2>
                  </div>
                  <button
                    type="button"
                    style={adminStyles.dangerButton}
                    onClick={() => {
                      void deleteOrphanImage(selectedItem)
                      removeItem(selectedItem.id)
                    }}
                  >
                    Remove item
                  </button>
                </div>

                <div className="form-grid" style={adminStyles.formGrid}>
                  <label style={adminStyles.field}>
                    <span>Name</span>
                    <input
                      value={selectedItem.name}
                      onChange={(event) => updateItem(selectedItem.id, { name: event.target.value })}
                    />
                  </label>
                  <label style={adminStyles.field}>
                    <span>Category</span>
                    <select
                      value={selectedItem.category}
                      onChange={(event) =>
                        updateItem(selectedItem.id, {
                          category: event.target.value as InventoryCategory,
                        })
                      }
                    >
                      {inventoryCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label style={adminStyles.field}>
                    <span>Brands</span>
                    <input
                      value={selectedItem.brands.join(', ')}
                      onChange={(event) =>
                        updateItem(selectedItem.id, {
                          brands: event.target.value
                            .split(',')
                            .map((value) => value.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Hero, Bajaj, Honda"
                    />
                  </label>
                  <label style={adminStyles.field}>
                    <span>Price text</span>
                    <input
                      value={selectedItem.priceText ?? ''}
                      onChange={(event) =>
                        updateItem(selectedItem.id, {
                          priceText: event.target.value,
                        })
                      }
                      placeholder="Starting from ₹..."
                    />
                  </label>
                  <label style={{ ...adminStyles.field, gridColumn: '1 / -1' }}>
                    <span>Description</span>
                    <textarea
                      value={selectedItem.description}
                      onChange={(event) =>
                        updateItem(selectedItem.id, {
                          description: event.target.value,
                        })
                      }
                      rows={4}
                    />
                  </label>
                  <label style={adminStyles.field}>
                    <span>Image file</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null
                        uploadFile(file, selectedItem.id)
                      }}
                    />
                  </label>
                  <label style={adminStyles.field}>
                    <span>Image alt text</span>
                    <input
                      value={selectedItem.imageAlt}
                      onChange={(event) =>
                        updateItem(selectedItem.id, {
                          imageAlt: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label style={adminStyles.field}>
                    <span>Tags</span>
                    <input
                      value={selectedItem.tags.join(', ')}
                      onChange={(event) =>
                        updateItem(selectedItem.id, {
                          tags: event.target.value
                            .split(',')
                            .map((value) => value.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="helmet, safety, commuter"
                    />
                  </label>
                  <label style={adminStyles.switchField}>
                    <input
                      type="checkbox"
                      checked={Boolean(selectedItem.featured)}
                      onChange={(event) =>
                        updateItem(selectedItem.id, {
                          featured: event.target.checked,
                        })
                      }
                    />
                    <span>Featured</span>
                  </label>
                  <label style={adminStyles.switchField}>
                    <input
                      type="checkbox"
                      checked={selectedItem.inStock !== false}
                      onChange={(event) =>
                        updateItem(selectedItem.id, {
                          inStock: event.target.checked,
                        })
                      }
                    />
                    <span>In stock</span>
                  </label>
                </div>
              </section>

              <section style={adminStyles.editorCard}>
                <div style={adminStyles.cardHeader}>
                  <div>
                    <p style={adminStyles.kicker}>Preview</p>
                    <h2 style={adminStyles.sectionTitle}>Live item card</h2>
                  </div>
                </div>
                <div style={adminStyles.previewCard}>
                  <img src={imagePreviewSrc(selectedItem)} alt={selectedItem.imageAlt} style={adminStyles.previewImage} />
                  <div style={adminStyles.previewBody}>
                    <div style={adminStyles.previewMeta}>
                      <span>{selectedItem.category}</span>
                      {selectedItem.featured ? <strong>Featured</strong> : <strong>Standard</strong>}
                    </div>
                    <h3>{selectedItem.name}</h3>
                    <p>{selectedItem.description}</p>
                    <div style={adminStyles.previewFooter}>
                      <span>{selectedItem.brands.join(' • ')}</span>
                      <span>{selectedItem.priceText ?? 'Price on request'}</span>
                    </div>
                  </div>
                </div>
                {currentFile ? <p style={adminStyles.helperText}>Pending image: {fileNameFromPath(currentFile.name)}</p> : null}
              </section>
            </>
          ) : (
            <section style={adminStyles.editorCard}>
              <p>No inventory item selected.</p>
            </section>
          )}
        </main>
      </section>

      <footer style={adminStyles.footer}>
        <span>{message}</span>
        {importError ? <span style={adminStyles.errorText}>{importError}</span> : null}
      </footer>
    </div>
  )
}

const adminStyles: Record<string, import('react').CSSProperties> = {
  shell: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #fffaf2 0%, #f7f6f2 100%)',
    color: '#1a1a1a',
    padding: '1.5rem',
    fontFamily: "'Sora', sans-serif",
  },
  authWrap: {
    minHeight: 'calc(100vh - 3rem)',
    display: 'grid',
    placeItems: 'center',
  },
  authCard: {
    width: 'min(720px, 100%)',
    padding: '1.35rem',
    background: 'white',
    borderRadius: '1.4rem',
    border: '1px solid rgba(43, 70, 97, 0.1)',
    boxShadow: '0 24px 60px rgba(16, 26, 36, 0.1)',
    display: 'grid',
    gap: '1rem',
  },
  authGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '0.9rem',
  },
  authActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    alignItems: 'center',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1rem',
  },
  kicker: {
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontSize: '0.75rem',
    color: '#ec4648',
  },
  title: { margin: '0.25rem 0 0', fontSize: 'clamp(2rem, 4vw, 3.5rem)' },
  subtitle: { margin: '0.5rem 0 0', color: '#645c51', maxWidth: '58ch' },
  headerActions: { display: 'flex', flexWrap: 'wrap', gap: '0.65rem', justifyContent: 'flex-end' },
  primaryButton: {
    border: 0,
    borderRadius: '999px',
    padding: '0.8rem 1.1rem',
    background: '#ec4648',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
  },
  secondaryButton: {
    borderRadius: '999px',
    padding: '0.8rem 1.1rem',
    border: '1px solid rgba(43, 70, 97, 0.18)',
    background: 'white',
    color: '#2b4661',
    fontWeight: 700,
    cursor: 'pointer',
  },
  dangerButton: {
    border: '1px solid rgba(184, 35, 43, 0.24)',
    borderRadius: '999px',
    padding: '0.7rem 1rem',
    background: 'rgba(236, 70, 72, 0.08)',
    color: '#b8232b',
    fontWeight: 700,
    cursor: 'pointer',
  },
  hiddenInput: { display: 'none' },
  settingsPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '0.9rem',
    padding: '1rem',
    background: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(43, 70, 97, 0.12)',
    borderRadius: '1.25rem',
    marginBottom: '1rem',
  },
  field: {
    display: 'grid',
    gap: '0.45rem',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '320px minmax(0, 1fr)',
    gap: '1rem',
    alignItems: 'start',
  },
  sidebar: {
    background: 'white',
    borderRadius: '1.3rem',
    border: '1px solid rgba(43, 70, 97, 0.1)',
    overflow: 'hidden',
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem',
    borderBottom: '1px solid rgba(43, 70, 97, 0.08)',
  },
  itemList: { display: 'grid' },
  itemButton: {
    display: 'grid',
    gridTemplateColumns: '56px minmax(0, 1fr) auto',
    gap: '0.75rem',
    alignItems: 'center',
    padding: '0.85rem 1rem',
    border: '0',
    borderBottom: '1px solid rgba(43, 70, 97, 0.08)',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
  },
  itemButtonActive: {
    background: 'rgba(236, 70, 72, 0.06)',
  },
  thumb: {
    width: '56px',
    height: '56px',
    borderRadius: '0.9rem',
    objectFit: 'cover',
  },
  itemButtonText: {
    display: 'grid',
    gap: '0.2rem',
    minWidth: 0,
  },
  statusDot: {
    width: '0.75rem',
    height: '0.75rem',
    borderRadius: '999px',
  },
  editor: {
    display: 'grid',
    gap: '1rem',
  },
  editorCard: {
    background: 'white',
    borderRadius: '1.3rem',
    border: '1px solid rgba(43, 70, 97, 0.1)',
    padding: '1rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  sectionTitle: { margin: '0.25rem 0 0', fontSize: '1.4rem' },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.9rem',
  },
  switchField: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    paddingTop: '0.5rem',
  },
  previewCard: {
    overflow: 'hidden',
    borderRadius: '1rem',
    border: '1px solid rgba(43, 70, 97, 0.08)',
    background: '#f7f6f2',
  },
  previewImage: {
    width: '100%',
    aspectRatio: '16 / 10',
    objectFit: 'cover',
  },
  previewBody: {
    padding: '1rem',
    display: 'grid',
    gap: '0.65rem',
  },
  previewMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontSize: '0.72rem',
    color: '#645c51',
  },
  previewFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    color: '#2b4661',
    fontWeight: 600,
    flexWrap: 'wrap',
  },
  helperText: {
    margin: '0.75rem 0 0',
    color: '#645c51',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    paddingTop: '1rem',
    color: '#645c51',
  },
  errorText: {
    color: '#b8232b',
  },
}

const adminCss = `
.admin-shell input,
.admin-shell select,
.admin-shell textarea {
  width: 100%;
  border-radius: 0.95rem;
  border: 1px solid rgba(43, 70, 97, 0.14);
  padding: 0.85rem 0.95rem;
  font: inherit;
  background: white;
  color: #1a1a1a;
}

.admin-shell textarea {
  resize: vertical;
}

.admin-shell input:focus,
.admin-shell select:focus,
.admin-shell textarea:focus {
  outline: 2px solid rgba(236, 70, 72, 0.2);
  border-color: rgba(236, 70, 72, 0.4);
}

@media (max-width: 1100px) {
  .admin-shell .auth-grid,
  .admin-shell .settings-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .admin-shell .content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .admin-shell .auth-grid,
  .admin-shell .settings-panel,
  .admin-shell .form-grid {
    grid-template-columns: 1fr;
  }
}
`

export default AdminPage
