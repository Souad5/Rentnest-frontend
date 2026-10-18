// Blog / guide articles shown on /blog, /blog/[slug] and the home page.
// Content is authored here (no CMS). Read time is computed from the actual
// word count of each article (~220 words per minute).

export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    /** https://images.unsplash.com/... URL (allowed by next.config images). */
    coverImage: string;
    category: 'Renting tips' | 'For landlords' | 'Neighbourhoods' | 'Money & payments';
    author: string;
    /** ISO date, e.g. "2026-09-14" */
    date: string;
    readMinutes: number;
    /** Article body as sections. */
    sections: Array<{ heading?: string; paragraphs: string[]; bullets?: string[] }>;
}

const WORDS_PER_MINUTE = 220;

function countWords(text: string): number {
    return text.split(/\s+/).filter(Boolean).length;
}

function withReadTime(post: Omit<BlogPost, 'readMinutes'>): BlogPost {
    const words = post.sections.reduce((total, section) => {
        const parts = [section.heading ?? '', ...section.paragraphs, ...(section.bullets ?? [])];
        return total + parts.reduce((sum, part) => sum + countWords(part), 0);
    }, countWords(post.title));
    return { ...post, readMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)) };
}

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;

const posts: Array<Omit<BlogPost, 'readMinutes'>> = [
    {
        slug: 'flat-viewing-checklist-dhaka',
        title: 'The flat-viewing checklist every Dhaka renter should carry',
        excerpt:
            'Water pressure, generator backup, gas lines and the lift at 9 PM — the practical things to check before you request dates on any flat.',
        coverImage: unsplash('1502672260266-1c1ef2d93688'),
        category: 'Renting tips',
        author: 'Nusrat Jahan',
        date: '2026-10-08',
        sections: [
            {
                paragraphs: [
                    'Photos on a listing tell you how a flat looks on its best afternoon. A viewing tells you how it lives on an ordinary Tuesday. Most of the problems tenants complain about after moving in — weak water supply, a dead lift during load-shedding, a damp corner behind the wardrobe — are visible in a twenty-minute visit if you know where to look.',
                    'Use this checklist when you visit a flat you found on RentNest, and only send a rental request once you are comfortable with the answers.',
                ],
            },
            {
                heading: 'Water, gas and power',
                paragraphs: [
                    'Utilities are where Dhaka flats differ most, and they are the hardest things to fix after you sign.',
                ],
                bullets: [
                    'Open every tap and run the shower for a minute. Ask whether the building relies on WASA supply, a deep tube well, or both, and how often the overhead tank is filled.',
                    'Ask if the kitchen has a piped Titas gas line or uses LPG cylinders, and who pays for cylinder refills.',
                    'Check whether the building has a generator or IPS, and exactly which points it powers — lights and fans only, or the lift and water pump too.',
                    'Look at the electricity meter. Prepaid meters make it easy to track your own usage; shared meters need a clear agreement in writing.',
                ],
            },
            {
                heading: 'Inside the flat',
                paragraphs: [
                    'Walk slowly and touch things. Landlords rarely mind, and it saves arguments later.',
                ],
                bullets: [
                    'Look for damp patches or fresh paint in bathroom corners and under windows — monsoon leaks show up here first.',
                    'Open and close every window, door and grill. Check that bedroom doors lock and that the main door has a working peephole.',
                    'Count the plug points in each room and check the AC points if you plan to install one.',
                    'Stand on the balcony and listen. A flat facing a main road or a market will sound very different at night.',
                ],
            },
            {
                heading: 'The building and the street',
                paragraphs: [
                    'A good flat in a poorly run building is still a frustrating home. Ask the guard or caretaker how long they have worked there and what the service charge covers — security, cleaning of stairs, lift maintenance and generator fuel are the usual items.',
                    'If you can, visit twice: once in daylight and once after dark. Check how the lane looks at night, whether the building gate is staffed, and how long it takes to reach the nearest main road during office hours.',
                ],
            },
            {
                heading: 'Before you send a request',
                paragraphs: [
                    'On RentNest a rental request is a firm proposal of dates. The landlord approves or rejects it, and once approved you pay the first month’s rent securely through Stripe to activate the rental. That makes it worth settling the small details first: who handles minor repairs, whether the service charge is included in the listed rent, and the move-in date that works for both of you.',
                    'Finally, read the reviews on the listing. Reviews on RentNest can only be written by tenants whose request for that property was approved, so they reflect real stays rather than drive-by opinions.',
                ],
            },
        ],
    },
    {
        slug: 'how-rentnest-protects-tenants',
        title: 'Request, approval, payment: how RentNest’s rental flow protects tenants',
        excerpt:
            'Why you never pay before a landlord says yes, how overlapping dates are blocked, and what happens to your money once you click pay.',
        coverImage: unsplash('1450101499163-c8848c66ca85'),
        category: 'Money & payments',
        author: 'Tanvir Ahmed',
        date: '2026-09-22',
        sections: [
            {
                paragraphs: [
                    'Renting through a broker or a Facebook group usually starts with money changing hands before anything is confirmed: a “token” payment to hold the flat, cash for the broker, an advance handed over in an envelope. If the deal falls through, getting that money back can be impossible.',
                    'RentNest is built around a different order of events. Every rental moves through the same clear steps, and at no point are you asked to pay for something the landlord has not agreed to.',
                ],
            },
            {
                heading: 'Step 1: you request specific dates',
                paragraphs: [
                    'When you find a property you like, you choose a start date and an end date and send a rental request. The start date has to be today or later, and the end date has to come after it. You can only have one pending request per property at a time, so landlords see a clean list of genuine proposals.',
                    'Sending a request costs nothing. It simply tells the landlord who you are and when you want to move in.',
                ],
            },
            {
                heading: 'Step 2: the landlord approves or rejects',
                paragraphs: [
                    'The landlord sees your request in their dashboard and decides. Only pending requests can be approved or rejected, so a decision cannot be quietly reversed later.',
                    'Before an approval goes through, RentNest checks the property’s calendar. If your dates overlap a rental that is already approved or active, the approval is blocked. This is what prevents the classic double-booking problem where two families are promised the same flat for the same month.',
                ],
            },
            {
                heading: 'Step 3: you pay the first month’s rent',
                paragraphs: [
                    'Only after approval does a “Pay now” option appear on your request. The amount is the property’s listed monthly rent, calculated by the server rather than typed in by anyone, so it cannot be changed at checkout.',
                    'Payment is handled by Stripe. Your card details are entered into Stripe’s secure form and never reach RentNest’s servers. Once Stripe confirms the payment, your rental switches to Active and a payment record with its transaction ID appears in your dashboard.',
                ],
                bullets: [
                    'Pending: your request is waiting for the landlord.',
                    'Approved: the landlord said yes; you can now pay.',
                    'Active: payment confirmed, the rental is on.',
                    'Rejected or Completed: the request is closed.',
                ],
            },
            {
                heading: 'Step 4: you can leave a review',
                paragraphs: [
                    'Once your request is approved, you can review the property — one review per tenant per property. Because only tenants with an approved or active rental can write reviews, the ratings you read on RentNest come from people who actually went through the process.',
                ],
            },
            {
                heading: 'What this means in practice',
                paragraphs: [
                    'Never send money outside the platform to “hold” a flat. If someone asks for a payment before approving your request on RentNest, treat it as a warning sign and contact our support team. Everything you need — the request, the decision, the payment and the receipt — lives in one place, with a record both sides can see.',
                ],
            },
        ],
    },
    {
        slug: 'pricing-your-rental-listing',
        title: 'How to price your rental listing so it gets requests in the first week',
        excerpt:
            'A practical method for landlords: compare like-for-like listings, price for what is included, and read the signal in your request numbers.',
        coverImage: unsplash('1554224155-6726b3ff858f'),
        category: 'For landlords',
        author: 'Farhana Rahman',
        date: '2026-09-03',
        sections: [
            {
                paragraphs: [
                    'Set the rent too high and your listing sits for weeks while the flat earns nothing. Set it too low and you lose money every month for the length of the tenancy. The good news is that pricing is not guesswork — it is a comparison exercise, and RentNest gives you most of the data you need.',
                ],
            },
            {
                heading: 'Start with genuine comparables',
                paragraphs: [
                    'Search RentNest for available properties in the same location and category as yours, and filter by the same number of bedrooms. Ignore listings that are clearly different — a furnished duplex with a rooftop is not a comparable for an unfurnished third-floor flat.',
                    'Write down five or six genuine matches and their monthly rent. Your starting price should sit inside that range, not above the most expensive one.',
                ],
            },
            {
                heading: 'Adjust for what tenants actually value',
                paragraphs: [
                    'Two flats with the same floor area can justify very different rents. Move your price up or down based on the details tenants ask about most.',
                ],
                bullets: [
                    'Lift and generator backup that covers the lift and water pump.',
                    'Piped gas rather than cylinders.',
                    'Dedicated car parking, which is scarce in most central neighbourhoods.',
                    'Whether the service charge is included in the rent or billed separately.',
                    'Distance to main roads, schools and, increasingly, a metro rail station.',
                ],
            },
            {
                heading: 'Be explicit about what the price covers',
                paragraphs: [
                    'Tenants compare the number they see on the card, so make that number honest. If the service charge is separate, say so in the first lines of your description and state the amount. A listing that looks cheaper but adds charges at the viewing stage loses trust quickly, and the reviews that follow will say so.',
                    'Remember that on RentNest the first payment a tenant makes is exactly the listed monthly rent, taken through Stripe once you approve their request. Keeping the listed rent accurate keeps that first payment simple for both of you.',
                ],
            },
            {
                heading: 'Read the signal from your dashboard',
                paragraphs: [
                    'Your landlord dashboard shows how many requests each property receives. Use it as feedback rather than vanity.',
                ],
                bullets: [
                    'No requests after two weeks, with good photos: the price is probably high for the area. Try a modest reduction.',
                    'Many requests within days: you priced well, or slightly low. Keep it for this tenancy and review next time.',
                    'Requests that you keep rejecting for date reasons: open your availability rather than cutting the price.',
                ],
            },
            {
                heading: 'Price for the tenancy, not the month',
                paragraphs: [
                    'A reliable tenant who stays for two years is worth more than an extra few dollars a month from a tenant who leaves after six. A fair price attracts more requests, which gives you more choice — and choosing the right tenant is the biggest single factor in how smoothly your rental runs.',
                ],
            },
        ],
    },
    {
        slug: 'gulshan-vs-dhanmondi-vs-uttara',
        title: 'Gulshan, Dhanmondi or Uttara? A renter’s guide to three Dhaka neighbourhoods',
        excerpt:
            'Commutes, character and the trade-offs that matter day to day — how three of Dhaka’s most searched areas compare for people looking to rent.',
        coverImage: unsplash('1477959858617-67f85cf4f1df'),
        category: 'Neighbourhoods',
        author: 'Arif Hossain',
        date: '2026-08-14',
        sections: [
            {
                paragraphs: [
                    'Ask ten people in Dhaka where you should live and you will get ten answers, most of them based on where their office is. That is a sensible starting point: in a city where a few kilometres can take an hour at peak time, your commute matters more than almost anything else. But each neighbourhood also has its own rhythm, and it is worth knowing what you are signing up for.',
                ],
            },
            {
                heading: 'Gulshan: central, international and busy',
                paragraphs: [
                    'Gulshan 1 and Gulshan 2 sit around Gulshan Lake in the diplomatic heart of the city, close to Banani and Baridhara. Many embassies, international organisations, corporate offices and some of the city’s best-known restaurants and cafés are here, which makes it popular with professionals and expatriate families.',
                    'The trade-offs are traffic around the two main circles at rush hour and rents that sit at the top end of the market. Flats tend to be newer, many with lifts, generators and parking, and buildings often have stricter security.',
                ],
                bullets: [
                    'Good for: people working in Gulshan, Banani or Tejgaon; families who want international schools nearby.',
                    'Check: parking availability, service charges, and noise if the flat faces a main road.',
                ],
            },
            {
                heading: 'Dhanmondi: established, leafy and close to everything',
                paragraphs: [
                    'Dhanmondi is one of Dhaka’s older planned residential areas, built around the long Dhanmondi Lake with its walking paths. It has a strong concentration of schools, coaching centres, hospitals and private universities, and it is well connected to Mohammadpur, Science Lab, New Market and Farmgate.',
                    'Housing ranges from older low-rise buildings to modern apartment blocks, so the gap between two flats on the same road can be large. Satmasjid Road and Mirpur Road carry heavy traffic, and some lanes are prone to waterlogging in heavy monsoon rain.',
                ],
                bullets: [
                    'Good for: students, families with school-age children, and anyone who wants a central base.',
                    'Check: the building’s age, water supply, and how the lane handles monsoon rain.',
                ],
            },
            {
                heading: 'Uttara: planned, spacious and connected by metro',
                paragraphs: [
                    'Uttara is a planned suburb in the north of the city, laid out in numbered sectors with wider roads and more open space than the older central areas. It sits next to Hazrat Shahjalal International Airport, and since the opening of MRT Line 6, the metro runs from Uttara North all the way to Motijheel, which has transformed the commute into the centre for many residents.',
                    'Rents are generally lower than in Gulshan for comparable space, and flats are often larger. The trade-off is distance: if your work is in the south of the city and not near a metro station, the daily journey can still be long.',
                ],
                bullets: [
                    'Good for: frequent flyers, families wanting more space, and anyone commuting along the metro line.',
                    'Check: walking distance to the nearest metro station and to your sector’s market.',
                ],
            },
            {
                heading: 'How to decide',
                paragraphs: [
                    'Map your weekday journeys first: office, school, and the places you visit most. Then search RentNest by location, compare a few listings side by side, and read the reviews left by previous tenants. If you are still unsure, our AI assistant can suggest available properties that match your area, budget and number of bedrooms.',
                ],
            },
        ],
    },
    {
        slug: 'advance-deposit-and-first-month-rent',
        title: 'Advance, deposit and first month’s rent: what you pay and when',
        excerpt:
            'The difference between an advance and a security deposit, what the law says, and exactly what RentNest collects when your rental is approved.',
        coverImage: unsplash('1579621970563-ebec7560ff3e'),
        category: 'Money & payments',
        author: 'Tanvir Ahmed',
        date: '2026-07-02',
        sections: [
            {
                paragraphs: [
                    'Money is where most landlord–tenant disputes begin, and usually because the two sides understood a word differently. “Advance”, “deposit” and “first month” are often used interchangeably in Dhaka, but they are not the same thing. Here is how to keep them straight.',
                ],
            },
            {
                heading: 'Three different payments',
                paragraphs: [
                    'It helps to name each payment precisely when you talk to a landlord.',
                ],
                bullets: [
                    'First month’s rent: the rent for the first month you live in the flat. It is not refundable — it pays for your stay.',
                    'Advance: rent paid ahead of time, usually adjusted against future months. In practice many landlords ask for several months up front.',
                    'Security deposit: money held against damage or unpaid bills and returned, minus agreed deductions, when you leave.',
                ],
            },
            {
                heading: 'What the law says',
                paragraphs: [
                    'Bangladesh’s Premises Rent Control Act, 1991 limits the advance a landlord may take to one month’s rent and requires landlords to give tenants a receipt for rent paid. Enforcement varies and local practice often differs, so if you are asked for a large advance, it is worth knowing where you stand. For anything beyond everyday questions, speak to a lawyer.',
                ],
            },
            {
                heading: 'What RentNest collects',
                paragraphs: [
                    'RentNest keeps the platform payment simple. After a landlord approves your rental request, you pay exactly one amount through the platform: the first month’s rent, equal to the property’s listed monthly price. The amount is calculated by our server from the listing, and the payment is processed by Stripe. When Stripe confirms it, your rental becomes Active and the payment appears in both your dashboard and the landlord’s earnings.',
                    'RentNest does not collect advances or security deposits. If a landlord asks for a deposit in addition to the first month’s rent, that is an arrangement between the two of you, made outside the platform.',
                ],
            },
            {
                heading: 'Protecting yourself on anything paid outside the platform',
                paragraphs: [
                    'If you agree to a deposit, put it in writing before any money moves.',
                ],
                bullets: [
                    'State the amount, what it covers, and the conditions for returning it.',
                    'Agree how long the landlord has to return it after you move out.',
                    'Photograph every room on move-in day and share the photos with the landlord.',
                    'Pay by bank transfer or mobile banking so there is a record, and ask for a signed receipt.',
                    'Never pay anything to “hold” a flat before your request is approved on RentNest.',
                ],
            },
            {
                heading: 'Your payment record',
                paragraphs: [
                    'Every payment made through RentNest has a transaction ID, an amount and a date, visible in your tenant dashboard under Payments. If anything looks wrong — a payment stuck as pending, or a rental that did not become active — contact support with the transaction ID and we will trace it with Stripe.',
                ],
            },
        ],
    },
    {
        slug: 'write-a-listing-tenants-trust',
        title: 'Writing a listing that tenants trust and request quickly',
        excerpt:
            'Titles, photos, amenities and descriptions: what makes a RentNest listing stand out, and how the AI description helper can give you a head start.',
        coverImage: unsplash('1560448204-e02f11c3d0e2'),
        category: 'For landlords',
        author: 'Farhana Rahman',
        date: '2026-05-20',
        sections: [
            {
                paragraphs: [
                    'Tenants scroll through dozens of listings before they send a single request. The ones they stop on share a few habits: a precise title, clear photos in good light, honest details, and a description that answers questions before anyone has to ask them.',
                    'Your listing goes live as soon as you publish it from your landlord dashboard, and our team reviews listings on an ongoing basis — inaccurate or misleading ones can be hidden. Getting it right the first time saves you from both problems.',
                ],
            },
            {
                heading: 'A title that says what it is',
                paragraphs: [
                    'Lead with the facts a tenant filters by: number of bedrooms, type of home and area. “3-bed family flat near Dhanmondi Lake” is more useful than “Beautiful dream home”. Keep it under about 60 characters so it is not cut off on the property card.',
                ],
            },
            {
                heading: 'Photos that do the selling',
                paragraphs: [
                    'You can add up to ten photo URLs, and the first one becomes the cover image on every card. Choose it carefully.',
                ],
                bullets: [
                    'Shoot in daylight with curtains open and lights on.',
                    'Include every room, the kitchen, at least one bathroom, the balcony and the view from it.',
                    'Add one photo of the building entrance or exterior so tenants recognise it on a viewing.',
                    'Avoid heavy filters and wide-angle distortion — tenants notice at the viewing, and it shows in reviews.',
                ],
            },
            {
                heading: 'Fill in every detail field',
                paragraphs: [
                    'Bedrooms, bathrooms, floor area in square feet and amenities are not optional extras. Tenants filter search results by bedrooms, and amenities such as lift, generator backup, parking or gas line are often the deciding factor between two similar flats. Each listing can carry up to twenty amenities — list the ones that are genuinely there.',
                ],
            },
            {
                heading: 'A description that answers questions',
                paragraphs: [
                    'Aim for a short, specific description of around 100 to 150 words. Cover the floor and whether there is a lift, the water and gas situation, what the rent includes, the nearest main road or metro station, and any house rules such as a preference for families.',
                    'If you are not sure where to start, use the AI description helper on the listing form. Give it the title, location and the details you have entered, and it drafts a description, a few highlights and suggested amenities. Treat the draft as a starting point: read it carefully, correct anything that is not accurate, and add the local details only you know.',
                ],
            },
            {
                heading: 'Keep it current',
                paragraphs: [
                    'Update the price if you change it, refresh photos after renovation, and respond to rental requests promptly. A listing that is accurate and a landlord who replies quickly are what earn the strong reviews that bring the next tenant in.',
                ],
            },
        ],
    },
];

export const blogPosts: BlogPost[] = posts
    .map(withReadTime)
    .sort((a, b) => b.date.localeCompare(a.date));

export function getPost(slug: string): BlogPost | undefined {
    return blogPosts.find((post) => post.slug === slug);
}
