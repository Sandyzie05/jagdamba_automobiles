import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import { directionsUrl, mapEmbedUrl, siteContent, type ContactPerson } from './siteContent'

const fadeInUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
}

function ContactActions({ person }: { person: ContactPerson }) {
  if (!person.phoneHref || !person.phoneDisplay) {
    return null
  }

  return (
    <div className="contact-actions">
      <a href={person.phoneHref}>Call</a>
      <a href={person.smsHref ?? person.phoneHref}>Message</a>
      <a href={person.whatsappHref ?? person.phoneHref} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
    </div>
  )
}

function App() {
  const reduceMotion = useReducedMotion()
  const [showStickyActions, setShowStickyActions] = useState(false)
  const { scrollYProgress } = useScroll()
  const heroImageY = useTransform(scrollYProgress, [0, 0.4], [0, reduceMotion ? 0 : 120])
  const heroImageScale = useTransform(scrollYProgress, [0, 0.4], [1, reduceMotion ? 1 : 1.08])
  const primaryContact = siteContent.contacts[0]

  useEffect(() => {
    const onScroll = () => {
      setShowStickyActions(window.scrollY > window.innerHeight * 0.55)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="page-shell">
      <header className="site-header">
        <a className="brand-lockup" href="#top" aria-label="Jagdamba Automobiles home">
          <img src={siteContent.supportingImages.brandMark} alt="Jagdamba Automobiles Hindi logo" />
          <div className="brand-caption">
            <span>Belthara Road, Ballia</span>
            <strong>स्पेयर पार्ट्स • सर्विस • हेलमेट • टायर्स</strong>
          </div>
        </a>

        <nav className="header-nav" aria-label="Primary">
          <a href="#services">Services</a>
          <a href="#gallery">Gallery</a>
          <a href="#contact">Contact</a>
        </nav>

        <a className="header-call" href={primaryContact.phoneHref}>
          Call Now
        </a>
      </header>

      <main id="top">
        <section className="hero" aria-label="Jagdamba Automobiles introduction">
          <div className="hero-media" aria-hidden="true">
            <motion.img
              src={siteContent.supportingImages.hero}
              alt=""
              style={{ y: heroImageY, scale: heroImageScale }}
            />
          </div>

          <div className="hero-inner">
            <div className="hero-copy">
              <motion.img
                className="hero-brand"
                src={siteContent.supportingImages.brandMark}
                alt="Jagdamba Automobiles logo"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
              <motion.p
                className="eyebrow"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08, ease: 'easeOut' }}
              >
                {siteContent.hero.eyebrow}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: reduceMotion ? 0 : 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.12, ease: 'easeOut' }}
              >
                {siteContent.hero.title}
              </motion.h1>
              <motion.p
                className="hero-description"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.2, ease: 'easeOut' }}
              >
                {siteContent.hero.description}
              </motion.p>

              <motion.div
                className="action-row"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.28, ease: 'easeOut' }}
              >
                <a className="button button-primary" href={primaryContact.phoneHref}>
                  Call
                </a>
                <a
                  className="button button-secondary"
                  href={primaryContact.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
                <a
                  className="button button-secondary"
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Get Directions
                </a>
              </motion.div>

              <motion.ul
                className="hero-proof"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.34, ease: 'easeOut' }}
              >
                {siteContent.trustPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </motion.ul>
            </div>
          </div>
        </section>

        <section className="section" id="services">
          <div className="section-shell">
            <motion.div className="section-heading" {...fadeInUp}>
              <span className="section-tag">Trusted locally</span>
              <h2>Built for riders, roadside mechanics and wholesale buyers.</h2>
              <p>
                Jagdamba Automobiles has served Belthara Road for more than three decades with
                practical stock, honest guidance and fitting help that customers return for.
              </p>
            </motion.div>

            <div className="story-grid">
              <motion.div className="story-copy" {...fadeInUp}>
                <p>
                  This is not a showroom made for display only. It is a working shop with fast
                  moving inventory, recognizable brands and real repair support on site. Customers
                  come in for a small daily replacement, a helmet upgrade, tyre needs, modified
                  accessories or servicing that gets the vehicle back on the road quickly.
                </p>
              </motion.div>

              <div className="service-list" aria-label="Service highlights">
                {siteContent.serviceHighlights.map((highlight, index) => (
                  <motion.article
                    className="service-item"
                    key={highlight.title}
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: index * 0.06 }}
                  >
                    <h3>{highlight.title}</h3>
                    <p>{highlight.description}</p>
                  </motion.article>
                ))}
              </div>
            </div>

            <div className="story-media">
              <motion.figure className="story-media-signboard" {...fadeInUp}>
                <img
                  src={siteContent.supportingImages.signboard}
                  alt="Jagdamba Automobiles signboard with parts, helmet and tyre references"
                  loading="lazy"
                />
              </motion.figure>
              <motion.figure className="story-media-helmet" {...fadeInUp}>
                <img
                  src="/images/WhatsApp Image 2026-03-22 at 23.23.01.jpeg"
                  alt="Helmet collection inside Jagdamba Automobiles"
                  loading="lazy"
                />
              </motion.figure>
            </div>
          </div>
        </section>

        <section className="section gallery-section" id="gallery">
          <div className="section-shell">
            <motion.div className="section-heading" {...fadeInUp}>
              <span className="section-tag">Inventory proof</span>
              <h2>Real stock, real shelves, real reasons to stop by.</h2>
              <p>
                The gallery is the proof: helmets lined deep, accessories ready for fitting, parts
                stacked for fast service and visual upgrades that riders like to inspect in person.
              </p>
            </motion.div>

            <ul className="brands-rail" aria-label="Brands available">
              {siteContent.brands.map((brand) => (
                <li key={brand}>{brand}</li>
              ))}
            </ul>

            <div className="gallery-columns">
              {siteContent.gallery.map((item, index) => (
                <motion.figure
                  className="gallery-item"
                  key={item.src}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.2) }}
                >
                  <img src={item.src} alt={item.alt} loading="lazy" />
                  <figcaption>{item.caption}</figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="contact">
          <div className="section-shell">
            <motion.div className="section-heading" {...fadeInUp}>
              <span className="section-tag">Call or visit</span>
              <h2>Come by the shop, send a WhatsApp message or call before you ride in.</h2>
              <p>
                Located near Krishi Mandi on Madhuban Marg, Jagdamba Automobiles serves local
                riders and nearby villages with parts, service help and ready-to-fit accessories.
              </p>
            </motion.div>

            <div className="contact-grid">
              <div className="contact-copy">
                <div className="contact-list">
                  {siteContent.contacts.map((person) => (
                    <motion.article className="contact-person" key={person.name} {...fadeInUp}>
                      <div className="contact-meta">
                        <h3>{person.name}</h3>
                        <span className="contact-role">{person.role}</span>
                      </div>
                      {person.phoneDisplay ? (
                        <div className="contact-note">{person.phoneDisplay}</div>
                      ) : null}
                      {person.experience ? (
                        <div className="contact-note">{person.experience}</div>
                      ) : null}
                      <ContactActions person={person} />
                    </motion.article>
                  ))}
                </div>

                <motion.div className="address-block" {...fadeInUp}>
                  <strong>{siteContent.location.name}</strong>
                  <span>{siteContent.location.address}</span>
                </motion.div>
              </div>

              <motion.div className="map-panel" {...fadeInUp}>
                <iframe
                  className="map-frame"
                  src={mapEmbedUrl}
                  title="Map for Jagdamba Automobiles"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="map-footer">
                  <p>Near Krishi Mandi, Belthara Road, Ballia.</p>
                  <a
                    className="button button-primary"
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in Maps
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-shell">
          <div className="footer-brand">
            <img src={siteContent.supportingImages.brandMark} alt="Jagdamba Automobiles logo" />
            <p>Belthara Road&apos;s long-standing stop for spare parts, accessories and service.</p>
          </div>

          <div className="action-row">
            <a className="button button-primary" href={primaryContact.phoneHref}>
              Call Bijendra Gupta
            </a>
            <a
              className="button"
              href={primaryContact.whatsappHref}
              target="_blank"
              rel="noreferrer"
              style={{ border: '1px solid rgba(43, 70, 97, 0.16)', color: 'var(--ink)' }}
            >
              WhatsApp
            </a>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showStickyActions ? (
          <motion.div
            className="sticky-actions"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            transition={{ duration: 0.22 }}
          >
            <div className="sticky-actions-inner">
              <a href={primaryContact.phoneHref}>Call</a>
              <a href={primaryContact.whatsappHref} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
              <a href={directionsUrl} target="_blank" rel="noreferrer">
                Directions
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default App
