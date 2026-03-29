import { motion, useReducedMotion } from 'framer-motion'
import { useDeferredValue, useEffect, useState } from 'react'
import {
  loadInventory,
  inventoryCategories,
  resolveInventoryImage,
  type InventoryCategory,
  type InventoryItem,
} from './inventory'
import { directionsUrl, siteContent } from './siteContent'

const fadeInUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
}

type Language = 'en' | 'hi'

const LANGUAGE_STORAGE_KEY = 'jagdamba-language'

const translations = {
  en: {
    languageLabel: 'Language',
    utility: [
      'Belthara Road retail + wholesale parts counter',
      '30+ years of trusted supply',
      'Call or WhatsApp for stock checks before you visit',
    ],
    nav: {
      inventory: 'Inventory',
      services: 'Services',
      visit: 'Visit',
    },
    actions: {
      call: 'Call',
      whatsapp: 'WhatsApp',
      message: 'Message',
      browseStock: 'Browse stock',
      openMaps: 'Open in Maps',
      admin: 'Admin',
    },
    hero: {
      kicker: 'Spare parts | service | helmets | tyres',
      title: 'Shop parts the way local riders actually buy them.',
      summary:
        'Fast-moving two-wheeler parts, helmets, tyres and on-site service for Belthara Road and nearby riders.',
      searchPlaceholder: 'Search helmets, lights, alloy wheels, filters...',
      quickCategories: ['Helmets', 'Tyres', 'Modified Lights', 'Alloy Wheels', 'Routine Parts', 'Service'],
      mechanic: '15 years of hands-on servicing experience on site',
    },
    sections: {
      browseLabel: 'Browse the shop',
      browseTitle: 'Shop by the parts riders ask for most.',
      browseBody: 'Start with the common categories, then explore live stock below.',
      inventoryLabel: 'Live inventory',
      inventoryTitle: 'Featured stock for the front counter and the workshop queue.',
      inventoryBody:
        'Use the category chips or search bar above to narrow the stock list. This section is designed to be updated from the admin page.',
      serviceLabel: 'Service support',
      serviceTitle: 'Parts, fitment and trusted service in one stop.',
      serviceBody: 'Stock on the shelf and practical on-site help when the job needs hands-on attention.',
      proofLabel: 'Inside the shop',
      proofTitle: 'Real shelves, real stock density, real browsing confidence.',
      proofBody:
        'The photos below keep the site grounded in the actual shop instead of drifting into generic dealership styling.',
      reviewsLabel: 'Reviews and trust',
      reviewsTitle: 'Google visibility plus the kind of feedback a parts shop earns over time.',
      reviewsBody:
        'Use Google Maps to find the shop, check public feedback and then see the review themes local riders care about most.',
      visitLabel: 'Visit the shop',
      visitTitle: 'Call first for stock, then stop by near Krishi Mandi.',
      visitBody:
        'Jagdamba Automobiles serves riders, mechanics and shop owners from Belthara Road and nearby areas with quick stock checks, walk-in browsing and on-site installation support.',
    },
    categoryPanels: [
      {
        title: 'Routine parts',
        text: 'Cables, filters, bulbs and everyday repair essentials.',
      },
      {
        title: 'Rider safety',
        text: 'Trusted helmets and daily-use safety accessories.',
      },
      {
        title: 'Tyres and fitment',
        text: 'Tyres and fitting help for common local needs.',
      },
      {
        title: 'Modified accessories',
        text: 'Alloy wheels, lights and visual upgrades.',
      },
    ],
    categoryLabels: {
      all: 'All',
      helmet: 'Helmet',
      tyre: 'Tyre',
      'spare-part': 'Spare Part',
      accessory: 'Accessory',
      service: 'Service',
      wholesale: 'Wholesale',
      bundle: 'Bundle',
    } satisfies Record<'all' | InventoryCategory, string>,
    inventory: {
      inStock: 'In stock',
      checkAvailability: 'Check availability',
      loading: 'Loading inventory...',
      loadError: 'Inventory could not be loaded right now.',
      featured: 'Featured',
      visibleItems: (count: number) => `${count} item${count === 1 ? '' : 's'} visible`,
    },
    proofCaptions: siteContent.gallery.map((item) => item.caption),
    reviewHighlights: [
      {
        title: 'Fast stock checks',
        body: 'Customers value getting a quick answer on what is available before they travel in.',
      },
      {
        title: 'Helpful fitting guidance',
        body: 'Riders appreciate practical advice and on-site support instead of just being sold a part.',
      },
      {
        title: 'Strong helmet and accessory range',
        body: 'The visible display helps customers compare options and choose with confidence.',
      },
    ],
    googleCard: {
      title: 'Google reviews and directions',
      rating: 'Trusted by local riders and workshop buyers',
      body: 'Open the shop on Google Maps to check directions, discoverability and public reviews.',
      cta: 'View on Google',
    },
    serviceHighlights: siteContent.serviceHighlights,
    contactRoles: {
      owner: 'Owner',
      mechanic: 'Main mechanic / service lead',
      mechanicExperience: '15 years of hands-on servicing experience',
      visitMapNote: 'Near Krishi Mandi, Madhuban Marg, Belthara Road.',
    },
    footer: 'Parts, accessories, helmets, tyres and service support for Belthara Road riders.',
  },
  hi: {
    languageLabel: 'भाषा',
    utility: [
      'बेल्थरा रोड का रिटेल और होलसेल पार्ट्स काउंटर',
      '30+ साल का भरोसेमंद व्यापार',
      'आने से पहले स्टॉक जानने के लिए कॉल या व्हाट्सऐप करें',
    ],
    nav: {
      inventory: 'इन्वेंटरी',
      services: 'सर्विस',
      visit: 'दुकान पर आएं',
    },
    actions: {
      call: 'कॉल',
      whatsapp: 'व्हाट्सऐप',
      message: 'मैसेज',
      browseStock: 'स्टॉक देखें',
      openMaps: 'मैप खोलें',
      admin: 'एडमिन',
    },
    hero: {
      kicker: 'स्पेयर पार्ट्स | सर्विस | हेलमेट | टायर',
      title: 'पार्ट्स वैसे चुनें जैसे स्थानीय राइडर्स सच में खरीदते हैं.',
      summary:
        'बेल्थरा रोड और आसपास के राइडर्स के लिए तेज़ी से मिलने वाले पार्ट्स, हेलमेट, टायर और ऑन-साइट सर्विस.',
      searchPlaceholder: 'हेलमेट, लाइट, अलॉय व्हील, फिल्टर खोजें...',
      quickCategories: ['हेलमेट', 'टायर', 'मॉडिफाइड लाइट', 'अलॉय व्हील', 'रूटीन पार्ट्स', 'सर्विस'],
      mechanic: '15 साल का ऑन-साइट सर्विस अनुभव',
    },
    sections: {
      browseLabel: 'दुकान ब्राउज़ करें',
      browseTitle: 'उन पार्ट्स से शुरू करें जिनकी सबसे ज़्यादा मांग होती है.',
      browseBody: 'पहले मुख्य कैटेगरी देखें, फिर नीचे लाइव स्टॉक ब्राउज़ करें.',
      inventoryLabel: 'लाइव इन्वेंटरी',
      inventoryTitle: 'फ्रंट काउंटर और वर्कशॉप के लिए चुना हुआ स्टॉक.',
      inventoryBody:
        'नीचे कैटेगरी चिप्स या ऊपर सर्च का उपयोग करके स्टॉक को जल्दी फ़िल्टर करें. यह सेक्शन एडमिन पेज से अपडेट किया जा सकता है.',
      serviceLabel: 'सर्विस सपोर्ट',
      serviceTitle: 'पार्ट्स, फिटमेंट और भरोसेमंद सर्विस एक ही जगह.',
      serviceBody: 'शेल्फ पर स्टॉक और जरूरत पड़ने पर ऑन-साइट मदद.',
      proofLabel: 'दुकान के अंदर',
      proofTitle: 'असली शेल्फ, असली स्टॉक और असली भरोसा.',
      proofBody:
        'नीचे की तस्वीरें साइट को असली दुकान से जोड़कर रखती हैं ताकि यह किसी सामान्य डीलरशिप जैसी न लगे.',
      reviewsLabel: 'रिव्यू और भरोसा',
      reviewsTitle: 'Google पर मौजूदगी और वही भरोसा जो एक पुरानी पार्ट्स दुकान कमाती है.',
      reviewsBody:
        'Google Maps पर दुकान देखें, सार्वजनिक फीडबैक देखें और फिर उन बातों को पढ़ें जिनके लिए स्थानीय राइडर्स सबसे ज़्यादा भरोसा करते हैं.',
      visitLabel: 'दुकान पर आएं',
      visitTitle: 'स्टॉक के लिए पहले कॉल करें, फिर कृषि मंडी के पास आ जाएं.',
      visitBody:
        'जगदम्बा ऑटोमोबाइल्स बेल्थरा रोड और आसपास के राइडर्स, मैकेनिक और दुकानदारों को तेज़ स्टॉक चेक, वॉक-इन ब्राउज़िंग और ऑन-साइट इंस्टॉलेशन सपोर्ट देता है.',
    },
    categoryPanels: [
      {
        title: 'रूटीन पार्ट्स',
        text: 'केबल, फिल्टर, बल्ब और रोज़मर्रा के ज़रूरी पार्ट्स.',
      },
      {
        title: 'राइडर सेफ्टी',
        text: 'भरोसेमंद हेलमेट और रोज़ काम आने वाली सेफ्टी एक्सेसरीज़.',
      },
      {
        title: 'टायर और फिटमेंट',
        text: 'टायर और आम जरूरतों के लिए फिटमेंट हेल्प.',
      },
      {
        title: 'मॉडिफाइड एक्सेसरीज़',
        text: 'अलॉय व्हील, लाइट और विजुअल अपग्रेड.',
      },
    ],
    categoryLabels: {
      all: 'सभी',
      helmet: 'हेलमेट',
      tyre: 'टायर',
      'spare-part': 'स्पेयर पार्ट',
      accessory: 'एक्सेसरी',
      service: 'सर्विस',
      wholesale: 'होलसेल',
      bundle: 'बंडल',
    } satisfies Record<'all' | InventoryCategory, string>,
    inventory: {
      inStock: 'स्टॉक में',
      checkAvailability: 'उपलब्धता पूछें',
      loading: 'इन्वेंटरी लोड हो रही है...',
      loadError: 'अभी इन्वेंटरी लोड नहीं हो सकी.',
      featured: 'मुख्य',
      visibleItems: (count: number) => `${count} आइटम दिखाई दे रहे हैं`,
    },
    proofCaptions: [
      'रिटेल और होलसेल ग्राहकों के लिए तेज़ी से बिकने वाले पार्ट्स की भरी हुई शेल्फ.',
      'रोज़मर्रा के अपग्रेड के लिए एक्सेसरीज़, लाइट और बॉक्स व्यवस्थित रूप से उपलब्ध.',
      'हेलमेट का मजबूत स्टॉक जिसे ग्राहक तुरंत पहचानते हैं.',
      'हेलमेट की ऐसी रेंज जिसे ग्राहक दुकान में आराम से देखकर चुन सकते हैं.',
      'रोज़ चलने वाले राइडर्स से लेकर अलग स्टाइल चाहने वालों तक के लिए विकल्प.',
      'सुरक्षा गियर उसी तरह प्रदर्शित है जैसे ग्राहक वास्तविक दुकान में देखते हैं.',
      'अलॉय व्हील और विजुअल अपग्रेड उन राइडर्स के लिए जो कस्टम लुक चाहते हैं.',
      'एक असली शोरूम जैसा स्पेस जहां ग्राहक आराम से देखकर तुलना कर सकते हैं.',
    ],
    reviewHighlights: [
      {
        title: 'तेज़ स्टॉक चेक',
        body: 'ग्राहक इस बात को महत्व देते हैं कि आने से पहले उन्हें जल्दी से उपलब्धता की जानकारी मिल जाती है.',
      },
      {
        title: 'फिटमेंट में मदद',
        body: 'राइडर्स को यह पसंद आता है कि यहां सिर्फ पार्ट नहीं बेचा जाता, सही सलाह और ऑन-साइट मदद भी मिलती है.',
      },
      {
        title: 'हेलमेट और एक्सेसरीज़ की मजबूत रेंज',
        body: 'सामने दिखने वाला स्टॉक ग्राहकों को विकल्प तुलना करके भरोसे से खरीदने में मदद करता है.',
      },
    ],
    googleCard: {
      title: 'Google रिव्यू और लोकेशन',
      rating: 'स्थानीय राइडर्स और वर्कशॉप ग्राहकों का भरोसा',
      body: 'दुकान को Google Maps पर खोलें, रास्ता देखें और सार्वजनिक रिव्यू पढ़ें.',
      cta: 'Google पर देखें',
    },
    serviceHighlights: [
      {
        title: 'रोज़मर्रा के राइडर्स और वर्कशॉप के लिए स्पेयर पार्ट्स',
        description:
          'Hero, Bajaj, Honda, TVS, Royal Enfield, Yamaha, Suzuki, KTM, Rajdoot और स्कूटर मॉडलों के लिए रिटेल और होलसेल स्टॉक.',
      },
      {
        title: 'राइडर्स जिन एक्सेसरीज़ के लिए पूछते हैं',
        description:
          'अलॉय व्हील, मॉडिफाइड लाइट, यूटिलिटी ऐड-ऑन, हेलमेट, मिरर, इंडिकेटर, स्टोरेज बॉक्स और फिटमेंट के लिए तैयार एक्सेसरीज़.',
      },
      {
        title: 'ऑन-साइट स्किल्ड सर्विस सपोर्ट',
        description:
          'रूटीन रिपेयर, फिटमेंट वर्क और प्रैक्टिकल ट्रबलशूटिंग चन्दन राज और सहायक स्टाफ द्वारा संभाली जाती है.',
      },
      {
        title: 'हेलमेट और टायर की ऐसी रेंज जिसके लिए लोग रुकते हैं',
        description:
          'Vega, Studds हेलमेट, MRF टायर और रोज़ बिकने वाले सेफ्टी प्रोडक्ट्स की मजबूत डिस्प्ले.',
      },
    ],
    contactRoles: {
      owner: 'स्वामी',
      mechanic: 'मुख्य मैकेनिक / सर्विस लीड',
      mechanicExperience: '15 साल का व्यावहारिक सर्विस अनुभव',
      visitMapNote: 'कृषि मंडी के पास, मधुबन मार्ग, बेल्थरा रोड.',
    },
    footer: 'बेल्थरा रोड के राइडर्स के लिए पार्ट्स, एक्सेसरीज़, हेलमेट, टायर और सर्विस सपोर्ट.',
  },
} as const

function InventoryTile({ item, language }: { item: InventoryItem; language: Language }) {
  const t = translations[language]
  const categoryLabel = t.categoryLabels[item.category]

  return (
    <article className="inventory-tile">
      <div className="inventory-image-shell">
        <img src={resolveInventoryImage(item.imagePath)} alt={item.imageAlt} loading="lazy" />
      </div>
      <div className="inventory-copy">
        <div className="inventory-meta">
          <span>{categoryLabel}</span>
          <strong>{item.inStock ? t.inventory.inStock : t.inventory.checkAvailability}</strong>
        </div>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="inventory-footer">
          <span>{item.brands.join(' / ')}</span>
          {item.priceText ? <strong>{item.priceText}</strong> : null}
        </div>
      </div>
    </article>
  )
}

export default function StorefrontPage() {
  const reduceMotion = useReducedMotion()
  const [language, setLanguage] = useState<Language>('en')
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [inventoryError, setInventoryError] = useState('')
  const [isLoadingInventory, setIsLoadingInventory] = useState(true)
  const [activeCategory, setActiveCategory] = useState<'all' | InventoryCategory>('all')
  const [searchInput, setSearchInput] = useState('')
  const deferredSearchInput = useDeferredValue(searchInput)
  const t = translations[language]
  const loadErrorMessage = t.inventory.loadError

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (storedLanguage === 'en' || storedLanguage === 'hi') {
      setLanguage(storedLanguage)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const collection = await loadInventory()
        if (!isMounted) {
          return
        }

        setInventory(collection.items)
      } catch {
        if (!isMounted) {
          return
        }

        setInventoryError(loadErrorMessage)
      } finally {
        if (isMounted) {
          setIsLoadingInventory(false)
        }
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [loadErrorMessage])

  const normalizedSearch = deferredSearchInput.trim().toLowerCase()
  const filteredInventory = inventory.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory
    const matchesSearch =
      normalizedSearch.length === 0 ||
      item.name.toLowerCase().includes(normalizedSearch) ||
      item.description.toLowerCase().includes(normalizedSearch) ||
      item.brands.some((brand) => brand.toLowerCase().includes(normalizedSearch))

    return matchesCategory && matchesSearch
  })

  const featuredItems = inventory.filter((item) => item.featured)
  const ownerContacts = siteContent.contacts.filter((contact) => contact.phoneHref)

  return (
    <div className="storefront-shell">
      <div className="utility-strip">
        <div className="utility-inner">
          {t.utility.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
      </div>

      <header className="retail-header">
        <a className="retail-brand" href="#top" aria-label="Jagdamba Automobiles home">
          <img src={siteContent.supportingImages.brandMark} alt="Jagdamba Automobiles logo" />
        </a>

        <nav className="retail-nav" aria-label="Primary">
          <a href="#inventory">{t.nav.inventory}</a>
          <a href="#services">{t.nav.services}</a>
          <a href="#visit">{t.nav.visit}</a>
        </nav>

        <div className="retail-actions">
          <div className="language-toggle" aria-label={t.languageLabel}>
            <button
              className={language === 'en' ? 'language-pill is-active' : 'language-pill'}
              onClick={() => setLanguage('en')}
              type="button"
            >
              EN
            </button>
            <button
              className={language === 'hi' ? 'language-pill is-active' : 'language-pill'}
              onClick={() => setLanguage('hi')}
              type="button"
            >
              हि
            </button>
          </div>
          <a className="retail-action-link" href={siteContent.contacts[0].phoneHref}>
            {t.actions.call}
          </a>
          <a
            className="retail-action-link retail-action-link--accent"
            href={siteContent.contacts[0].whatsappHref}
            target="_blank"
            rel="noreferrer"
          >
            {t.actions.whatsapp}
          </a>
        </div>
      </header>

      <main id="top">
        <section className="retail-hero">
          <div className="retail-hero-inner">
            <motion.div
              className="retail-hero-copy"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
            >
              <p className="retail-kicker">{t.hero.kicker}</p>
              <h1>{t.hero.title}</h1>
              <p className="retail-summary">{t.hero.summary}</p>

              <div className="retail-search">
                <label className="sr-only" htmlFor="inventory-search">
                  Search inventory
                </label>
                <input
                  id="inventory-search"
                  type="search"
                  placeholder={t.hero.searchPlaceholder}
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
                <a href="#inventory">{t.actions.browseStock}</a>
              </div>

              <div className="quick-category-row" aria-label="Quick categories">
                {t.hero.quickCategories.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="retail-hero-media"
              initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.08, ease: 'easeOut' }}
            >
              <div className="hero-image-frame">
                <img src={siteContent.supportingImages.hero} alt="Jagdamba Automobiles storefront" />
              </div>
              <div className="hero-service-strip">
                <strong>Chandan Raj</strong>
                <span>{t.hero.mechanic}</span>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="category-rack section-block">
          <div className="section-header">
            <div>
              <span className="section-label">{t.sections.browseLabel}</span>
              <h2>{t.sections.browseTitle}</h2>
            </div>
            <p>{t.sections.browseBody}</p>
          </div>

          <div className="category-grid">
            {t.categoryPanels.map((item) => (
              <motion.article className="category-panel" key={item.title} {...fadeInUp}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="inventory-section section-block" id="inventory">
          <div className="section-header">
            <div>
              <span className="section-label">{t.sections.inventoryLabel}</span>
              <h2>{t.sections.inventoryTitle}</h2>
            </div>
            <p>{t.sections.inventoryBody}</p>
          </div>

          <div className="inventory-filter-bar">
            <div className="filter-chip-row" aria-label="Inventory categories">
              {(['all', ...inventoryCategories.map((category) => category.value)] as const).map((category) => (
                <button
                  className={category === activeCategory ? 'filter-chip is-active' : 'filter-chip'}
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  type="button"
                >
                  {t.categoryLabels[category]}
                </button>
              ))}
            </div>
            <div className="inventory-meta-note">
              {isLoadingInventory
                ? t.inventory.loading
                : inventoryError || t.inventory.visibleItems(filteredInventory.length)}
            </div>
          </div>

          {featuredItems.length > 0 ? (
            <div className="featured-row">
              {featuredItems.slice(0, 3).map((item) => (
                <motion.article className="featured-band" key={item.id} {...fadeInUp}>
                  <img src={resolveInventoryImage(item.imagePath)} alt={item.imageAlt} loading="lazy" />
                  <div>
                    <span>{t.inventory.featured}</span>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : null}

          <div className="inventory-grid">
            {filteredInventory.map((item) => (
              <motion.div key={item.id} {...fadeInUp}>
                <InventoryTile item={item} language={language} />
              </motion.div>
            ))}
          </div>
        </section>

        <section className="service-band" id="services">
          <div className="service-band-inner">
            <div className="section-header section-header--light">
              <div>
                <span className="section-label">{t.sections.serviceLabel}</span>
                <h2>{t.sections.serviceTitle}</h2>
              </div>
              <p>{t.sections.serviceBody}</p>
            </div>

            <div className="service-band-grid">
              {t.serviceHighlights.map((item) => (
                <motion.article className="service-band-item" key={item.title} {...fadeInUp}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="proof-section section-block">
          <div className="section-header">
            <div>
              <span className="section-label">{t.sections.proofLabel}</span>
              <h2>{t.sections.proofTitle}</h2>
            </div>
            <p>{t.sections.proofBody}</p>
          </div>

          <div className="proof-mosaic">
            {siteContent.gallery.slice(0, 4).map((item, index) => (
              <motion.figure className="proof-shot" key={item.src} {...fadeInUp}>
                <img src={item.src} alt={item.alt} loading="lazy" />
                <figcaption>{t.proofCaptions[index] ?? item.caption}</figcaption>
              </motion.figure>
            ))}
          </div>
        </section>

        <section className="reviews-section section-block">
          <div className="section-header">
            <div>
              <span className="section-label">{t.sections.reviewsLabel}</span>
              <h2>{t.sections.reviewsTitle}</h2>
            </div>
            <p>{t.sections.reviewsBody}</p>
          </div>

          <div className="reviews-grid">
            <motion.article className="google-review-panel" {...fadeInUp}>
              <span className="google-chip">Google</span>
              <h3>{t.googleCard.title}</h3>
              <strong>{t.googleCard.rating}</strong>
              <p>{t.googleCard.body}</p>
              <a href={directionsUrl} target="_blank" rel="noreferrer">
                {t.googleCard.cta}
              </a>
            </motion.article>

            <div className="review-highlight-grid">
              {t.reviewHighlights.map((review) => (
                <motion.article className="review-highlight-card" key={review.title} {...fadeInUp}>
                  <div className="review-stars" aria-hidden="true">
                    <span>★ ★ ★ ★ ★</span>
                  </div>
                  <h3>{review.title}</h3>
                  <p>{review.body}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="visit-section section-block" id="visit">
          <div className="visit-grid">
            <motion.div className="visit-copy" {...fadeInUp}>
              <span className="section-label">{t.sections.visitLabel}</span>
              <h2>{t.sections.visitTitle}</h2>
              <p>{t.sections.visitBody}</p>

              <div className="visit-contact-list">
                {ownerContacts.map((contact) => (
                  <div className="visit-contact" key={contact.name}>
                    <strong>{contact.name}</strong>
                    <span>{contact.phoneDisplay}</span>
                    <div className="visit-actions">
                      <a href={contact.phoneHref}>{t.actions.call}</a>
                      <a href={contact.smsHref}>{t.actions.message}</a>
                      <a href={contact.whatsappHref} target="_blank" rel="noreferrer">
                        {t.actions.whatsapp}
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="address-panel">
                <strong>{siteContent.location.name}</strong>
                <span>{siteContent.location.address}</span>
              </div>
            </motion.div>

            <motion.div className="visit-map-shell" {...fadeInUp}>
              <iframe
                className="visit-map"
                src={`https://www.google.com/maps?q=${encodeURIComponent(siteContent.location.address)}&z=15&output=embed`}
                title="Jagdamba Automobiles map"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="visit-map-footer">
                <p>{t.contactRoles.visitMapNote}</p>
                <a href={directionsUrl} target="_blank" rel="noreferrer">
                  {t.actions.openMaps}
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="retail-footer">
        <img src={siteContent.supportingImages.brandMark} alt="Jagdamba Automobiles logo" />
        <div>
          <strong>Jagdamba Automobiles</strong>
          <p>{t.footer}</p>
        </div>
        <a className="retail-admin-link" href={`${import.meta.env.BASE_URL}admin.html`}>
          {t.actions.admin}
        </a>
      </footer>
    </div>
  )
}
