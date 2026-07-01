import {
  Sparkles,
  Sun,
  Car,
  Brush,
  ShieldCheck,
  Paintbrush,
  Droplets,
  Cog,
  Waves,
  Gauge,
  Snowflake,
  Layers,
  type LucideIcon,
} from "lucide-react"

export type ServiceCategory = "protection" | "detailing" | "wash" | "maintenance"

export type ServicePackage = {
  name: string
  price: string
  features: string[]
}

export type ServicePricing = {
  /** "Starting at" price shown on cards and the pricing table. */
  from: string
  /** Pricing basis, e.g. "per session", "per panel". */
  unit?: string
  /** Optional tiers for services that are sold in packages. */
  packages?: ServicePackage[]
  /** Fine print shown under the price. */
  note?: string
}

export type ProcessStep = {
  title: string
  description: string
}

export type Service = {
  slug: string
  title: string
  category: ServiceCategory
  icon: LucideIcon
  /** One-line summary for cards. */
  tagline: string
  /** Full description for the detail page. */
  description: string
  features: string[]
  process: ProcessStep[]
  pricing: ServicePricing
  /** Slugs of related services. */
  related: string[]
}

export type Bundle = {
  slug: string
  name: string
  price: string
  description: string
  features: string[]
  featured?: boolean
}

export const CATEGORIES: {
  id: ServiceCategory
  label: string
  description: string
}[] = [
  {
    id: "protection",
    label: "Paint & Protection",
    description: "Long-lasting coatings, films, and tints that shield your finish.",
  },
  {
    id: "detailing",
    label: "Detailing",
    description: "Deep interior and exterior cleaning for a showroom finish.",
  },
  {
    id: "wash",
    label: "Wash",
    description: "Quick, thorough washes to keep your car fresh.",
  },
  {
    id: "maintenance",
    label: "Maintenance & Repairs",
    description: "Essential upkeep and repairs to keep you running smoothly.",
  },
]

// Prices are realistic placeholders in PHP — edit freely in this one file.
export const SERVICES: Service[] = [
  {
    slug: "ceramic-coating",
    title: "Ceramic Coating",
    category: "protection",
    icon: Sparkles,
    tagline: "A liquid glass shield for a deep, lasting gloss.",
    description:
      "Our ceramic coating bonds a durable, hydrophobic layer to your paint, locking in a mirror-like shine while repelling water, dirt, and UV damage. It keeps your car cleaner for longer and makes every future wash easier.",
    features: [
      "Multi-year paint protection",
      "Hydrophobic, self-cleaning surface",
      "UV and oxidation resistance",
      "Enhanced depth and gloss",
    ],
    process: [
      { title: "Decontaminate", description: "Wash, clay, and strip the paint of all contaminants." },
      { title: "Correct", description: "Polish out swirls and scratches for a flawless base." },
      { title: "Coat & cure", description: "Apply the ceramic layers and cure for lasting durability." },
    ],
    pricing: {
      from: "₱8,000",
      packages: [
        { name: "1-Year Coating", price: "₱8,000", features: ["Single-layer coating", "6-month check-up", "Hydrophobic finish"] },
        { name: "3-Year Coating", price: "₱15,000", features: ["Dual-layer coating", "Paint decontamination", "Annual maintenance"] },
        { name: "5-Year Coating", price: "₱25,000", features: ["Premium multi-layer", "Light paint correction", "Priority re-coat support"] },
      ],
      note: "Final price depends on vehicle size and paint condition.",
    },
    related: ["ppf", "nano-ceramic-tint", "exterior-detailing"],
  },
  {
    slug: "nano-ceramic-tint",
    title: "Nano Ceramic Tint",
    category: "protection",
    icon: Sun,
    tagline: "Heat-rejecting window tint that keeps you cool.",
    description:
      "Nano ceramic film blocks a large share of heat and UV rays without interfering with signals or visibility. Drive cooler, protect your interior from fading, and enjoy added privacy.",
    features: [
      "Superior heat rejection",
      "99% UV protection",
      "Signal-friendly (no interference)",
      "Reduced glare and fading",
    ],
    process: [
      { title: "Measure & cut", description: "Precision-cut film to your exact window dimensions." },
      { title: "Prep glass", description: "Deep-clean every window for a bubble-free application." },
      { title: "Apply & cure", description: "Install the film and allow it to set for a flawless finish." },
    ],
    pricing: {
      from: "₱12,000",
      packages: [
        { name: "Sedan", price: "₱12,000", features: ["Full sedan set", "Heat-rejection film", "Lifetime peel warranty"] },
        { name: "SUV / Pickup", price: "₱16,000", features: ["Full SUV set", "Higher heat rejection", "Lifetime peel warranty"] },
        { name: "Premium", price: "₱22,000", features: ["Top-tier ceramic film", "Maximum heat rejection", "Windshield included"] },
      ],
    },
    related: ["ceramic-coating", "interior-detailing"],
  },
  {
    slug: "exterior-detailing",
    title: "Exterior Detailing",
    category: "detailing",
    icon: Car,
    tagline: "A meticulous outside clean and restored gloss.",
    description:
      "A thorough exterior treatment that washes, decontaminates, and protects your paint, wheels, and trim — restoring a clean, glossy finish that turns heads.",
    features: [
      "Hand wash & decontamination",
      "Clay bar treatment",
      "Wax or sealant protection",
      "Wheel and tire detailing",
    ],
    process: [
      { title: "Wash", description: "Foam pre-wash and gentle hand wash to lift grime." },
      { title: "Decontaminate", description: "Clay and iron removal for a glass-smooth surface." },
      { title: "Protect", description: "Apply wax or sealant and dress tires and trim." },
    ],
    pricing: { from: "₱1,500", unit: "per session", note: "Price varies with vehicle size and condition." },
    related: ["interior-detailing", "ceramic-coating", "carwash"],
  },
  {
    slug: "interior-detailing",
    title: "Interior Detailing",
    category: "detailing",
    icon: Brush,
    tagline: "A deep cabin clean that feels brand new.",
    description:
      "We shampoo, vacuum, and condition every surface inside your car — seats, carpets, dashboard, and vents — leaving a fresh, spotless, and sanitized cabin.",
    features: [
      "Interior shampoo & vacuum",
      "Leather cleaning & conditioning",
      "Dashboard and trim restore",
      "Odor removal & sanitizing",
    ],
    process: [
      { title: "Clear & vacuum", description: "Remove debris and vacuum every nook." },
      { title: "Deep clean", description: "Shampoo fabrics and clean all hard surfaces." },
      { title: "Condition", description: "Treat leather and trim, then deodorize the cabin." },
    ],
    pricing: { from: "₱2,000", unit: "per session", note: "Price varies with vehicle size and condition." },
    related: ["exterior-detailing", "aircon-cleaning"],
  },
  {
    slug: "ppf",
    title: "PPF — Paint Protection Film",
    category: "protection",
    icon: ShieldCheck,
    tagline: "Invisible armor against chips, scratches, and stains.",
    description:
      "Paint Protection Film is a clear, self-healing layer applied over your paint to absorb rock chips, scratches, and road debris — keeping high-impact areas flawless for years.",
    features: [
      "Self-healing top coat",
      "Rock chip & scratch protection",
      "Stain and yellowing resistance",
      "Virtually invisible finish",
    ],
    process: [
      { title: "Prep", description: "Decontaminate and measure the panels to be covered." },
      { title: "Apply film", description: "Lay precision-cut film with careful alignment." },
      { title: "Finish", description: "Squeegee, tuck edges, and cure for a seamless look." },
    ],
    pricing: {
      from: "₱25,000",
      packages: [
        { name: "Partial Front", price: "₱25,000", features: ["Partial hood & fenders", "Self-healing film", "Edge sealing"] },
        { name: "Full Front", price: "₱45,000", features: ["Full hood, fenders, mirrors", "Bumper coverage", "Headlight protection"] },
        { name: "Full Body", price: "₱120,000", features: ["Complete body coverage", "Maximum protection", "Premium warranty"] },
      ],
      note: "Coverage and price depend on vehicle size and model.",
    },
    related: ["ceramic-coating", "exterior-detailing"],
  },
  {
    slug: "repainting-and-repairs",
    title: "Repainting & Repairs",
    category: "maintenance",
    icon: Paintbrush,
    tagline: "Factory-quality repainting and dent repair.",
    description:
      "From scratches and dents to full panel repaints, our team restores your bodywork with color-matched precision so it looks like nothing ever happened.",
    features: [
      "Color-matched repainting",
      "Dent and scratch repair",
      "Panel resurfacing",
      "Clear-coat blending",
    ],
    process: [
      { title: "Assess", description: "Inspect damage and match your exact paint code." },
      { title: "Repair & prep", description: "Fix dents, sand, and prime the affected panels." },
      { title: "Paint & blend", description: "Spray, blend, and clear-coat for a seamless finish." },
    ],
    pricing: { from: "₱5,000", unit: "per panel", note: "Quoted after inspection based on damage extent." },
    related: ["exterior-detailing", "ceramic-coating"],
  },
  {
    slug: "carwash",
    title: "Carwash",
    category: "wash",
    icon: Droplets,
    tagline: "A fast, thorough wash and dry.",
    description:
      "Our signature carwash gives your vehicle a clean exterior, spotless windows, and dressed tires — perfect for keeping your car fresh between details.",
    features: [
      "Foam wash & rinse",
      "Hand dry finish",
      "Window cleaning",
      "Tire dressing",
    ],
    process: [
      { title: "Pre-rinse", description: "Foam and rinse to loosen surface dirt." },
      { title: "Wash", description: "Gentle hand wash from top to bottom." },
      { title: "Dry & dress", description: "Towel dry and dress the tires." },
    ],
    pricing: { from: "₱150", unit: "per wash", note: "Price varies with vehicle size." },
    related: ["engine-wash", "under-wash", "exterior-detailing"],
  },
  {
    slug: "engine-wash",
    title: "Engine Wash",
    category: "wash",
    icon: Cog,
    tagline: "A clean, degreased engine bay.",
    description:
      "We safely degrease and clean your engine bay, removing built-up grime and dust so your engine looks great and runs cooler.",
    features: [
      "Safe degreasing",
      "Sensitive-component protection",
      "Grime and dust removal",
      "Dressing for plastics & hoses",
    ],
    process: [
      { title: "Protect", description: "Cover sensitive electrical components." },
      { title: "Degrease", description: "Apply degreaser and agitate built-up grime." },
      { title: "Rinse & dress", description: "Low-pressure rinse, dry, and dress surfaces." },
    ],
    pricing: { from: "₱350", unit: "per session" },
    related: ["carwash", "under-wash", "change-oil"],
  },
  {
    slug: "under-wash",
    title: "Under Wash",
    category: "wash",
    icon: Waves,
    tagline: "A clean undercarriage, free of mud and salt.",
    description:
      "A high-pressure undercarriage wash that blasts away mud, salt, and road grime — helping prevent rust and keeping your chassis clean.",
    features: [
      "High-pressure undercarriage clean",
      "Mud and salt removal",
      "Rust-prevention rinse",
      "Wheel-well cleaning",
    ],
    process: [
      { title: "Lift & inspect", description: "Raise the vehicle and inspect the underside." },
      { title: "Power wash", description: "High-pressure rinse of the chassis and wheel wells." },
      { title: "Finish", description: "Final rinse and quick-dry pass." },
    ],
    pricing: { from: "₱300", unit: "per session" },
    related: ["carwash", "engine-wash", "under-coating"],
  },
  {
    slug: "change-oil",
    title: "Change Oil",
    category: "maintenance",
    icon: Gauge,
    tagline: "Fresh oil and filter for a healthier engine.",
    description:
      "We drain your old oil, replace the filter, and refill with quality oil suited to your engine — keeping it running smoothly and extending its life.",
    features: [
      "Engine oil drain & refill",
      "Oil filter replacement",
      "Quality oil options",
      "Level and leak check",
    ],
    process: [
      { title: "Drain", description: "Warm the engine and drain the old oil." },
      { title: "Replace filter", description: "Swap the oil filter and check seals." },
      { title: "Refill & check", description: "Add fresh oil and verify the level." },
    ],
    pricing: { from: "₱1,200", unit: "per service", note: "Excludes premium synthetic oil upgrades." },
    related: ["engine-wash", "aircon-cleaning"],
  },
  {
    slug: "aircon-cleaning",
    title: "Aircon Cleaning",
    category: "maintenance",
    icon: Snowflake,
    tagline: "Cooler, fresher air for your cabin.",
    description:
      "We clean your air-conditioning system and vents to remove dust, mold, and odors — restoring cold, fresh airflow throughout your cabin.",
    features: [
      "Vent and duct cleaning",
      "Mold and odor removal",
      "Cabin filter check",
      "Improved airflow & cooling",
    ],
    process: [
      { title: "Inspect", description: "Check the system, vents, and cabin filter." },
      { title: "Clean", description: "Treat ducts and vents to remove buildup and odor." },
      { title: "Test", description: "Verify cooling performance and airflow." },
    ],
    pricing: { from: "₱2,500", unit: "per service" },
    related: ["interior-detailing", "change-oil"],
  },
  {
    slug: "under-coating",
    title: "Under Coating",
    category: "protection",
    icon: Layers,
    tagline: "A protective barrier against rust and noise.",
    description:
      "An undercarriage coating that seals your chassis against moisture, salt, and abrasion — preventing rust while dampening road noise for a quieter ride.",
    features: [
      "Rust and corrosion protection",
      "Moisture and salt barrier",
      "Road-noise dampening",
      "Abrasion resistance",
    ],
    process: [
      { title: "Clean & dry", description: "Wash the undercarriage and dry it fully." },
      { title: "Mask", description: "Protect components that should stay coating-free." },
      { title: "Apply", description: "Spray an even protective layer and cure." },
    ],
    pricing: { from: "₱6,000", unit: "per vehicle", note: "Price varies with vehicle size." },
    related: ["under-wash", "ppf"],
  },
]

export const BUNDLES: Bundle[] = [
  {
    slug: "complete-wash",
    name: "Complete Wash",
    price: "₱700",
    description: "Carwash, engine wash, and under wash in one visit.",
    features: ["Full carwash", "Engine bay wash", "Undercarriage wash", "Tire dressing"],
  },
  {
    slug: "full-detail",
    name: "Full Detail",
    price: "₱3,000",
    description: "Complete interior and exterior detailing.",
    features: ["Exterior detailing", "Interior detailing", "Clay bar treatment", "Wax protection"],
    featured: true,
  },
  {
    slug: "ultimate-protection",
    name: "Ultimate Protection",
    price: "₱30,000",
    description: "Our top-tier protection package for total peace of mind.",
    features: ["Ceramic coating", "Front PPF", "Nano ceramic tint", "Priority support"],
  },
]

export function getServiceBySlug(slug: string): Service | undefined {
  return SERVICES.find((service) => service.slug === slug)
}

export function getServicesByCategory(category: ServiceCategory): Service[] {
  return SERVICES.filter((service) => service.category === category)
}

export function serviceSlugs(): string[] {
  return SERVICES.map((service) => service.slug)
}
