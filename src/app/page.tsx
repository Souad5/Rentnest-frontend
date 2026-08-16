import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
  ShieldCheck,
  Key,
  ArrowRight,
  Sparkles,
  Bed,
  Bath,
  Square,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Temporary mock featured listings (replaced dynamically when connected to backend API GET /api/properties?featured=true)
const FEATURED_PROPERTIES = [
  {
    id: "prop-1",
    title: "Modern Minimalist Penthouse",
    location: "Downtown, New York",
    price: 3200,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1450,
    type: "Apartment",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
  },
  {
    id: "prop-2",
    title: "Cozy Suburban Family Home",
    location: "Austin, Texas",
    price: 2400,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2200,
    type: "House",
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
  },
  {
    id: "prop-3",
    title: "Luxury Oceanfront Condo",
    location: "Miami, Florida",
    price: 4100,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1100,
    type: "Condo",
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 py-20 lg:py-32 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="container mx-auto px-4 relative z-10 max-w-6xl">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-300 px-4 py-1 text-sm rounded-full inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Your Smart Rental Marketplace
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-balance leading-tight">
              Find & List Rental Properties <span className="text-blue-400">With Ease</span>
            </h1>
            <p className="text-lg text-slate-300 sm:text-xl text-balance">
              RentNest seamlessly connects landlords and tenants with instant request workflows, online Stripe payments, and hassle-free management.
            </p>

            {/* Quick Search Redirect Bar */}
            <form action="/properties" method="GET" className="pt-4 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-2 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-md">
                <div className="relative flex-1 flex items-center">
                  <MapPin className="absolute left-3.5 text-slate-400 w-5 h-5" />
                  <Input
                    type="text"
                    name="location"
                    placeholder="Search by city, location, or neighborhood..."
                    className="pl-11 bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-400 h-12 rounded-xl focus-visible:ring-blue-500"
                  />
                </div>
                <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-500 text-white h-12 px-8 rounded-xl font-medium gap-2">
                  <Search className="w-4 h-4" />
                  Search Properties
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 py-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">1,200+</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Verified Listings</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">98%</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Rental Approvals</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">100%</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Secure Payments</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">24/7</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Platform Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Grid */}
      <section className="py-20 container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <Badge variant="outline" className="text-blue-600 border-blue-200 dark:border-blue-900 mb-2">
              Featured Properties
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Explore Top Handpicked Homes
            </h2>
          </div>
          <Button asChild variant="ghost" className="text-blue-600 hover:text-blue-700 gap-1.5 self-start sm:self-auto">
            <Link href="/properties">
              View All Properties <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURED_PROPERTIES.map((property) => (
            <Card key={property.id} className="overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 flex flex-col">
              <div className="relative h-56 w-full bg-slate-100 dark:bg-slate-800">
                <Image
                  src={property.imageUrl}
                  alt={property.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <Badge className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white border-none px-3 py-1">
                  {property.type}
                </Badge>
                <div className="absolute bottom-3 right-3 bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg text-sm shadow-md">
                  ${property.price.toLocaleString()} <span className="text-xs font-normal">/ mo</span>
                </div>
              </div>

              <CardHeader className="p-5 pb-2">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1">
                  {property.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                  {property.location}
                </p>
              </CardHeader>

              <CardContent className="p-5 pt-3 pb-4 flex-1">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1 font-medium">
                    <Bed className="w-4 h-4 text-slate-400" /> {property.bedrooms} Beds
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Bath className="w-4 h-4 text-slate-400" /> {property.bathrooms} Baths
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Square className="w-4 h-4 text-slate-400" /> {property.sqft} sqft
                  </span>
                </div>
              </CardContent>

              <CardFooter className="p-5 pt-0">
                <Button asChild className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white">
                  <Link href={`/properties/${property.id}`}>
                    View Details & Request
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* How RentNest Works */}
      <section className="bg-slate-50 dark:bg-slate-900 py-20 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="outline" className="text-blue-600 border-blue-200 dark:border-blue-900">
              Simple 3-Step Process
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              How RentNest Works
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Engineered to make finding, renting, and listing homes as seamless as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm relative space-y-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-500" /> Browse & Select
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Filter by price, amenities, or location. View full property details, photos, and landlord credentials.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm relative space-y-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-500" /> Submit Rental Request
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Send an interactive rental request directly to the landlord. Track real-time status badges in your dashboard.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm relative space-y-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-500" /> Pay & Move In
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Once approved, complete payment securely via Stripe Checkout, activate your lease, and leave reviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role CTA Banner */}
      <section className="py-20 container mx-auto px-4 max-w-6xl">
        <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Are you a Landlord or Property Owner?
            </h2>
            <p className="text-blue-100 leading-relaxed">
              List your properties on RentNest today. Screen prospective tenants, approve requests, and collect rental payments effortlessly.
            </p>
            <ul className="space-y-2 text-sm text-blue-50 pt-2 flex flex-col sm:flex-row sm:gap-6 justify-center md:justify-start">
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Instant Approvals
              </li>
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Full Earnings Overview
              </li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 shadow-md">
              <Link href="/register">Join as Landlord</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-blue-300 text-white hover:bg-blue-700/50">
              <Link href="/register">Sign Up as Tenant</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}