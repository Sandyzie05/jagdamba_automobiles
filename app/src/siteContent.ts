export type ContactAction = 'call' | 'sms' | 'whatsapp' | 'directions'

export interface ContactPerson {
  name: string
  role: string
  experience?: string
  phoneDisplay?: string
  phoneHref?: string
  smsHref?: string
  whatsappHref?: string
}

export interface ServiceHighlight {
  title: string
  description: string
}

export interface GalleryItem {
  src: string
  alt: string
  caption: string
}

export const siteContent = {
  location: {
    name: 'Jagdamba Automobiles',
    address:
      'Jagdamba Automobiles, Madhuban Marg, near Krishi Mandi, Belthara Road, Ballia, Uttar Pradesh 221715, India',
  },
  trustPoints: [
    '30+ years in business',
    'Retail + wholesale supply',
    '15+ years service experience',
  ],
  hero: {
    eyebrow: 'बेल्थरा रोड का भरोसेमंद टू-व्हीलर पार्ट्स और सर्विस सेंटर',
    title: 'Spare parts, helmets, tyres and dependable service for every ride.',
    description:
      'Serving riders, mechanics and shop owners with daily-use parts, modified accessories and on-site fitting support in one trusted stop.',
  },
  contacts: [
    {
      name: 'Bijendra Gupta',
      role: 'Owner',
      phoneDisplay: '+91 9415839783',
      phoneHref: 'tel:+919415839783',
      smsHref: 'sms:+919415839783',
      whatsappHref: 'https://wa.me/919415839783',
    },
    {
      name: 'Praveen (Banty) Gupta',
      role: 'Owner',
      phoneDisplay: '+91 9532486427',
      phoneHref: 'tel:+919532486427',
      smsHref: 'sms:+919532486427',
      whatsappHref: 'https://wa.me/919532486427',
    },
    {
      name: 'Chandan Raj',
      role: 'Main mechanic / service lead',
      experience: '15 years of hands-on servicing experience',
    },
  ] satisfies ContactPerson[],
  serviceHighlights: [
    {
      title: 'Spare parts for everyday riders and workshops',
      description:
        'Retail and wholesale stock for Hero, Bajaj, Honda, TVS, Royal Enfield, Yamaha, Suzuki, KTM, Rajdoot and scooter models.',
    },
    {
      title: 'Accessories that riders ask for',
      description:
        'Alloy wheels, modified lights, utility add-ons, helmets, mirrors, indicators, storage boxes and finishing parts ready for fitting.',
    },
    {
      title: 'Servicing with skilled support on site',
      description:
        'Routine repairs, fitment work and practical troubleshooting handled by Chandan Raj with additional helpers for installation support.',
    },
    {
      title: 'Helmet and tyre collection worth the stop',
      description:
        'Strong display of Vega and Studds helmets, MRF tyres and other daily-moving safety essentials for riders from town and nearby villages.',
    },
  ] satisfies ServiceHighlight[],
  brands: [
    'Hero',
    'Bajaj',
    'Honda',
    'TVS',
    'Royal Enfield',
    'Yamaha',
    'Suzuki',
    'KTM',
    'Rajdoot',
    'Scooter Parts',
    'MRF Tyres',
    'Vega Helmets',
    'Modified Lights',
    'Alloy Wheels',
  ],
  gallery: [
    {
      src: '/images/WhatsApp Image 2026-03-22 at 22.54.43.jpeg',
      alt: 'Long view inside the shop showing shelves full of spare parts and accessories.',
      caption: 'Deep shelves of fast-moving parts for retail and wholesale buyers.',
    },
    {
      src: '/images/WhatsApp Image 2026-03-22 at 22.54.42.jpeg',
      alt: 'Accessory display with top boxes, lights and hanging products inside the store.',
      caption: 'Utility accessories, lights and boxes lined up for everyday upgrades.',
    },
    {
      src: '/images/WhatsApp Image 2026-03-22 at 22.54.44.jpeg',
      alt: 'Wall of helmets and stacked branded boxes inside the shop.',
      caption: 'A strong helmet wall with trusted brands riders recognize immediately.',
    },
    {
      src: '/images/WhatsApp Image 2026-03-22 at 22.54.42 (1).jpeg',
      alt: 'Large display of helmets arranged on glass shelves.',
      caption: 'Helmet inventory that feels full, visible and easy to compare in person.',
    },
    {
      src: '/images/WhatsApp Image 2026-03-22 at 23.23.02.jpeg',
      alt: 'Close-up of a helmet held in the foreground with helmet inventory behind it.',
      caption: 'From daily commuter helmets to bolder styles for younger riders.',
    },
    {
      src: '/images/WhatsApp Image 2026-03-22 at 23.22.59.jpeg',
      alt: 'Close-up of helmets on display with one black helmet held near the camera.',
      caption: 'Safety gear displayed the way customers actually shop for it.',
    },
    {
      src: '/images/WhatsApp Image 2026-03-22 at 23.58.28.jpeg',
      alt: 'Modified alloy wheels displayed in blue, silver and black finishes.',
      caption: 'Alloy wheels and visual upgrades for riders who want a custom touch.',
    },
    {
      src: '/images/WhatsApp Image 2026-03-22 at 23.23.04.jpeg',
      alt: 'Interior photo showing multiple shelves of helmets and accessories.',
      caption: 'A dense, real-world showroom where customers can browse and compare.',
    },
  ] satisfies GalleryItem[],
  supportingImages: {
    hero: '/images/store_front.jpeg',
    brandMark: '/images/brand-mark.png',
    signboard: '/images/store_info.jpeg',
  },
}

export const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteContent.location.address)}`
export const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(siteContent.location.address)}&z=15&output=embed`
