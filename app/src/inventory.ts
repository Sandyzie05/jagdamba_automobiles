export type InventoryCategory =
  | 'helmet'
  | 'tyre'
  | 'spare-part'
  | 'accessory'
  | 'service'
  | 'wholesale'
  | 'bundle'

export interface InventoryItem {
  id: string
  name: string
  category: InventoryCategory
  brands: string[]
  description: string
  priceText?: string
  featured?: boolean
  inStock?: boolean
  imagePath: string
  imageAlt: string
  sku?: string
  tags: string[]
  updatedAt: string
}

export interface InventoryDocument {
  version: 1
  shopName: string
  currency: string
  updatedAt: string
  items: InventoryItem[]
}

export type InventoryCollection = InventoryDocument

export interface InventoryDraftItem extends Omit<InventoryItem, 'updatedAt'> {
  updatedAt?: string
  draftImageFile?: File | null
  draftImagePreviewUrl?: string
}

export interface InventoryPublishAsset {
  itemId: string
  file: File
  path: string
}

export const DEFAULT_INVENTORY_FILE = 'data/inventory.json'
export const DEFAULT_PUBLIC_IMAGE_PREFIX = 'images/inventory'

export const inventoryCategories: Array<{ value: InventoryCategory; label: string }> = [
  { value: 'helmet', label: 'Helmet' },
  { value: 'tyre', label: 'Tyre' },
  { value: 'spare-part', label: 'Spare part' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'service', label: 'Service' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'bundle', label: 'Bundle' },
]

export const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

const nowIso = () => new Date().toISOString()

const normalizeStringList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.map((entry) => String(entry).trim()).filter(Boolean)
    : []

const normalizeCategory = (value: unknown): InventoryCategory => {
  const allowed: InventoryCategory[] = [
    'helmet',
    'tyre',
    'spare-part',
    'accessory',
    'service',
    'wholesale',
    'bundle',
  ]

  return allowed.includes(value as InventoryCategory) ? (value as InventoryCategory) : 'accessory'
}

const normalizeImagePath = (value: unknown) => {
  const raw = String(value ?? '').trim()
  if (!raw) {
    return publicAsset('images/store_front.jpeg')
  }

  if (/^(https?:|data:|blob:)/i.test(raw)) {
    return raw
  }

  return raw.replace(/^\/+/, '')
}

export const normalizeInventoryItem = (value: Partial<InventoryItem> & { id?: string }): InventoryItem => ({
  id:
    value.id?.trim() ||
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `item-${Date.now()}`),
  name: String(value.name ?? 'Untitled item').trim(),
  category: normalizeCategory(value.category),
  brands: normalizeStringList(value.brands),
  description: String(value.description ?? '').trim(),
  priceText: value.priceText ? String(value.priceText).trim() : undefined,
  featured: Boolean(value.featured),
  inStock: value.inStock ?? true,
  imagePath: normalizeImagePath(value.imagePath),
  imageAlt: String(value.imageAlt ?? value.name ?? 'Inventory image').trim(),
  sku: value.sku ? String(value.sku).trim() : undefined,
  tags: normalizeStringList(value.tags),
  updatedAt: value.updatedAt ? String(value.updatedAt) : nowIso(),
})

export const normalizeInventoryDocument = (value: unknown): InventoryDocument => {
  const raw = (value ?? {}) as Partial<InventoryDocument> & {
    items?: Array<Partial<InventoryItem> & { id?: string }>
  }

  return {
    version: 1,
    shopName: String(raw.shopName ?? 'Jagdamba Automobiles').trim(),
    currency: String(raw.currency ?? 'INR').trim() || 'INR',
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : nowIso(),
    items: Array.isArray(raw.items) ? raw.items.map(normalizeInventoryItem) : [],
  }
}

export const serializeInventoryDocument = (document: InventoryDocument) =>
  JSON.stringify(normalizeInventoryDocument(document), null, 2)

export const parseInventoryDocument = (json: string) => normalizeInventoryDocument(JSON.parse(json) as unknown)

export const createInventoryItem = (overrides: Partial<InventoryItem> = {}): InventoryItem =>
  normalizeInventoryItem({
    name: 'New inventory item',
    category: 'accessory',
    brands: ['Jagdamba'],
    description: 'Add a short description for this item.',
    priceText: 'On request',
    featured: false,
    inStock: true,
    imagePath: publicAsset('images/store_front.jpeg'),
    imageAlt: 'Inventory item photo',
    tags: ['new'],
    ...overrides,
  })

export const createSeedInventory = (): InventoryDocument => ({
  version: 1,
  shopName: 'Jagdamba Automobiles',
  currency: 'INR',
  updatedAt: nowIso(),
  items: [
    createInventoryItem({
      id: 'full-face-helmet',
      name: 'Full-face helmets for daily riders',
      category: 'helmet',
      brands: ['Vega', 'Studds', 'Axor'],
      description: 'Everyday commuter helmets and premium options with multiple sizes available.',
      priceText: 'Starting from ₹',
      featured: true,
      imagePath: publicAsset('images/WhatsApp Image 2026-03-22 at 23.23.01.jpeg'),
      imageAlt: 'Helmet wall inside Jagdamba Automobiles',
      tags: ['helmet', 'safety', 'commuter'],
    }),
    createInventoryItem({
      id: 'mrf-tyres',
      name: 'MRF tyres and road-ready replacements',
      category: 'tyre',
      brands: ['MRF'],
      description: 'Tyres for common two-wheelers with quick fitting support available on site.',
      priceText: 'Ask for fitment',
      featured: true,
      imagePath: publicAsset('images/WhatsApp Image 2026-03-22 at 23.58.28.jpeg'),
      imageAlt: 'Alloy wheels and tyre display at the shop',
      tags: ['tyre', 'upgrade', 'fitment'],
    }),
    createInventoryItem({
      id: 'spare-parts-wall',
      name: 'Fast-moving spare parts for workshop use',
      category: 'spare-part',
      brands: ['Hero', 'Bajaj', 'Honda', 'TVS'],
      description: 'Retail and wholesale parts for the most common models in the area.',
      priceText: 'Wholesale available',
      featured: true,
      imagePath: publicAsset('images/WhatsApp Image 2026-03-22 at 22.54.43.jpeg'),
      imageAlt: 'Shelves packed with spare parts and accessories',
      tags: ['spare-part', 'wholesale', 'retail'],
    }),
    createInventoryItem({
      id: 'accessory-shelf',
      name: 'Modified lights and accessories',
      category: 'accessory',
      brands: ['Universal'],
      description: 'Lights, mirrors, indicators and small upgrades riders ask for every week.',
      priceText: 'Available in store',
      imagePath: publicAsset('images/WhatsApp Image 2026-03-22 at 22.54.42.jpeg'),
      imageAlt: 'Accessory display shelves inside the shop',
      tags: ['accessory', 'lights', 'custom'],
    }),
    createInventoryItem({
      id: 'alloy-wheel-display',
      name: 'Alloy wheels and custom visual upgrades',
      category: 'bundle',
      brands: ['Universal'],
      description: 'Looks, fitting support and practical guidance for riders who want a sharper build.',
      priceText: 'Custom pricing',
      featured: false,
      imagePath: publicAsset('images/WhatsApp Image 2026-03-22 at 23.58.28.jpeg'),
      imageAlt: 'Custom alloy wheel display in the store',
      tags: ['bundle', 'custom', 'alloy-wheel'],
    }),
    createInventoryItem({
      id: 'service-bay',
      name: 'Motorcycle and scooter servicing',
      category: 'service',
      brands: ['Chandan Raj'],
      description: 'Routine service, part replacement and fitting help from an experienced mechanic.',
      priceText: 'Call for appointment',
      featured: true,
      imagePath: publicAsset('images/store_front.jpeg'),
      imageAlt: 'Front view of the Jagdamba Automobiles shop',
      tags: ['service', 'repair', 'mechanic'],
    }),
    createInventoryItem({
      id: 'wholesale-stock',
      name: 'Wholesale stock for local retailers',
      category: 'wholesale',
      brands: ['Jagdamba Automobiles'],
      description: 'Bulk supply for nearby mechanics and shops that need dependable replenishment.',
      priceText: 'Wholesale pricing',
      imagePath: publicAsset('images/WhatsApp Image 2026-03-22 at 22.54.42 (1).jpeg'),
      imageAlt: 'Helmet and stock shelves in the store',
      tags: ['wholesale', 'stock', 'retail'],
    }),
  ],
})

export const featuredInventory = createSeedInventory().items.filter((item) => item.featured)

export const loadInventory = async (filePath = DEFAULT_INVENTORY_FILE): Promise<InventoryCollection> => {
  try {
    const response = await fetch(publicAsset(filePath))
    if (!response.ok) {
      throw new Error(`Failed to load inventory from ${filePath}`)
    }

    return normalizeInventoryDocument((await response.json()) as unknown)
  } catch {
    return createSeedInventory()
  }
}

export const inventoryImagePath = (itemId: string, fileName: string) => {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]+/g, '-').toLowerCase()
  const extension = safeName.includes('.') ? safeName.slice(safeName.lastIndexOf('.')) : '.jpg'
  const normalizedId = itemId.replace(/[^a-zA-Z0-9_-]+/g, '-').toLowerCase()

  return `${DEFAULT_PUBLIC_IMAGE_PREFIX}/${normalizedId}${extension}`
}

export const resolveInventoryImage = (path: string) =>
  /^(https?:|data:|blob:)/i.test(path) ? path : publicAsset(path.replace(/^\/+/, ''))

export const isRemoteAsset = (path: string) => /^(https?:|data:|blob:)/i.test(path)
