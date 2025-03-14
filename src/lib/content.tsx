import Image from 'next/image';
import { generateRandomId } from './utils';
import { SlSocialTwitter, SlSocialInstagram, SlSocialFacebook, SlSocialLinkedin } from 'react-icons/sl';
import { FaTelegramPlane } from 'react-icons/fa';

type NavItem = {
    id: number | string;
    name: string;
    href?: string;
    lightIcon?: string;
    darkIcon?: string;
    external?: boolean;
    subItems?: {
        id: number | string;
        name: string;
        href?: string;
        external?: boolean;
        itemsList?: { id: string; brokerName: string; brokerLogo: string; href?: string; external?: boolean }[];
        linksList?: { id: string; name: string; href: string; external?: boolean }[];
    }[];
};

export const navItems: NavItem[] = [
    {
        id: 1,
        name: 'Home',
        href: '/',
        lightIcon: './assets/icons/homeIcon-light.svg',
        darkIcon: './assets/icons/homeIcon-dark.svg',
    },
    {
        id: generateRandomId(),
        name: 'Brokers',
        subItems: [
            {
                id: generateRandomId(),
                name: 'Forex Brokers',
                itemsList: [
                    { id: generateRandomId(), brokerName: '4XC', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    { id: generateRandomId(), brokerName: 'AAFX', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    { id: generateRandomId(), brokerName: 'Amana', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    { id: generateRandomId(), brokerName: 'AvaTrade', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    { id: generateRandomId(), brokerName: 'Axi', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    { id: generateRandomId(), brokerName: 'Axiory', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    {
                        id: generateRandomId(),
                        brokerName: 'BlackBull Markets',
                        brokerLogo: '/assets/FbsBroker.png',
                        href: '#',
                    },
                    { id: generateRandomId(), brokerName: 'Errante', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    {
                        id: generateRandomId(),
                        brokerName: 'Exclusive Markets',
                        brokerLogo: '/assets/FbsBroker.png',
                        href: '#',
                    },
                    { id: generateRandomId(), brokerName: 'Exness', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    {
                        id: generateRandomId(),
                        brokerName: 'FIBO Group',
                        brokerLogo: '/assets/FbsBroker.png',
                        href: '#',
                    },
                    { id: generateRandomId(), brokerName: 'FINVEO', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    { id: generateRandomId(), brokerName: 'ForexMart', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    { id: generateRandomId(), brokerName: 'FxPro', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    { id: generateRandomId(), brokerName: 'FXTM', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    { id: generateRandomId(), brokerName: 'Fxview', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    {
                        id: generateRandomId(),
                        brokerName: 'Global Prime',
                        brokerLogo: '/assets/FbsBroker.png',
                        href: '#',
                    },
                    {
                        id: generateRandomId(),
                        brokerName: 'GO Markets',
                        brokerLogo: '/assets/FbsBroker.png',
                        href: '#',
                    },
                    {
                        id: generateRandomId(),
                        brokerName: 'GM Markets',
                        brokerLogo: '/assets/FbsBroker.png',
                        href: '#',
                    },
                    {
                        id: generateRandomId(),
                        brokerName: 'InstaForex',
                        brokerLogo: '/assets/FbsBroker.png',
                        href: '#',
                    },
                    {
                        id: generateRandomId(),
                        brokerName: 'Key to Markets',
                        brokerLogo: '/assets/FbsBroker.png',
                        href: '#',
                    },
                    {
                        id: generateRandomId(),
                        brokerName: 'Lime Prime',
                        brokerLogo: '/assets/FbsBroker.png',
                        href: '#',
                    },
                    { id: generateRandomId(), brokerName: 'LMFX', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    { id: generateRandomId(), brokerName: 'M4Markets', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    {
                        id: generateRandomId(),
                        brokerName: 'Markets.com',
                        brokerLogo: '/assets/FbsBroker.png',
                        href: '#',
                    },
                    { id: generateRandomId(), brokerName: 'Naga', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    { id: generateRandomId(), brokerName: 'NordFX', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    { id: generateRandomId(), brokerName: 'OneRoyal', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    { id: generateRandomId(), brokerName: 'PU Prime', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    {
                        id: generateRandomId(),
                        brokerName: 'Scope Markets',
                        brokerLogo: '/assets/FbsBroker.png',
                        href: '#',
                    },
                    { id: generateRandomId(), brokerName: 'Skilling', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    {
                        id: generateRandomId(),
                        brokerName: 'Saxo Markets',
                        brokerLogo: '/assets/FbsBroker.png',
                        href: '#',
                    },
                    { id: generateRandomId(), brokerName: 'SMFX', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    { id: generateRandomId(), brokerName: 'TickMill', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    { id: generateRandomId(), brokerName: 'TopFX', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    { id: generateRandomId(), brokerName: 'TradeMax', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    {
                        id: generateRandomId(),
                        brokerName: 'Traders Trust',
                        brokerLogo: '/assets/FbsBroker.png',
                        href: '#',
                    },
                    {
                        id: generateRandomId(),
                        brokerName: 'Trust Capital',
                        brokerLogo: '/assets/FbsBroker.png',
                        href: '#',
                    },
                    {
                        id: generateRandomId(),
                        brokerName: 'VT Markets',
                        brokerLogo: '/assets/FbsBroker.png',
                        href: '#',
                    },
                    { id: generateRandomId(), brokerName: 'XM', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    { id: generateRandomId(), brokerName: 'XTB', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    {
                        id: generateRandomId(),
                        brokerName: 'ThinkMarkets',
                        brokerLogo: '/assets/FbsBroker.png',
                        href: '#',
                    },
                    { id: generateRandomId(), brokerName: 'TitanFX', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    {
                        id: generateRandomId(),
                        brokerName: 'TIOmarkets',
                        brokerLogo: '/assets/FbsBroker.png',
                        href: '#',
                    },
                    {
                        id: generateRandomId(),
                        brokerName: 'Solidary Markets',
                        brokerLogo: '/assets/FbsBroker.png',
                        href: '#',
                    },
                    {
                        id: generateRandomId(),
                        brokerName: 'SquaredFinancial',
                        brokerLogo: '/assets/FbsBroker.png',
                        href: '#',
                    },
                    {
                        id: generateRandomId(),
                        brokerName: 'Startrader',
                        brokerLogo: '/assets/FbsBroker.png',
                        href: '#',
                    },
                    {
                        id: generateRandomId(),
                        brokerName: 'Thunder Forex',
                        brokerLogo: '/assets/FbsBroker.png',
                        href: '#',
                    },
                    { id: generateRandomId(), brokerName: 'T4Trade', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    { id: generateRandomId(), brokerName: 'TMGM', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    { id: generateRandomId(), brokerName: 'TeraFX', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    { id: generateRandomId(), brokerName: 'Tradeview', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    {
                        id: generateRandomId(),
                        brokerName: 'Trust Capital TC',
                        brokerLogo: '/assets/FbsBroker.png',
                        href: '#',
                    },
                    {
                        id: generateRandomId(),
                        brokerName: 'VT Markets',
                        brokerLogo: '/assets/FbsBroker.png',
                        href: '#',
                    },
                    { id: generateRandomId(), brokerName: 'XM', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                    { id: generateRandomId(), brokerName: 'XTB', brokerLogo: '/assets/FbsBroker.png', href: '#' },
                ],
            },
            {
                id: generateRandomId(),
                name: 'Forex Brokers List',
                href: 'https://www.cashbackforex.com/brokers/forex-rebates',
                external: true,
            },
            { id: generateRandomId(), name: 'Ratings/ Reviews', href: '#' },
            { id: generateRandomId(), name: 'Guides', href: '#' },
            { id: generateRandomId(), name: 'Best Brokers 2025', href: '#' },
            { id: generateRandomId(), name: 'Brokers Promotions', href: '#' },
            { id: generateRandomId(), name: 'Brokers Contests', href: '#' },
        ],
    },
    {
        id: generateRandomId(),
        name: 'Crypto',
        subItems: [
            { id: generateRandomId(), name: 'Crypto Exchanges', href: '#' },
            { id: generateRandomId(), name: 'Crypto Exchanges List', href: '#' },
            { id: generateRandomId(), name: 'Ratings/ Reviews', href: '#' },
            { id: generateRandomId(), name: 'Guides', href: '#' },
            { id: generateRandomId(), name: 'Best Exchanges 2025', href: '#' },
            { id: generateRandomId(), name: 'Exchanges Promotions', href: '#' },
            { id: generateRandomId(), name: 'Exchanges Contests', href: '#' },
        ],
    },
    {
        id: generateRandomId(),
        name: 'Props',
        subItems: [
            { id: generateRandomId(), name: 'Prop Firms', href: '#' },
            { id: generateRandomId(), name: 'Prop Firms List', href: '#' },
            { id: generateRandomId(), name: 'Ratings/ Reviews', href: '#' },
            { id: generateRandomId(), name: 'Guides', href: '#' },
            { id: generateRandomId(), name: 'Best Prop Firms 2025', href: '#' },
            { id: generateRandomId(), name: 'Prop Firms Promotions', href: '#' },
            { id: generateRandomId(), name: 'Prop Firms Contests', href: '#' },
        ],
    },
    {
        id: generateRandomId(),
        name: 'Tools',
        subItems: [
            { id: generateRandomId(), name: 'Currency Converter', href: '#' },
            { id: generateRandomId(), name: 'Fibonacci Calculator', href: '#' },
            { id: generateRandomId(), name: 'Margin Calculator', href: '#' },
            { id: generateRandomId(), name: 'Pip Calculator', href: '#' },
            { id: generateRandomId(), name: 'Pivot Point Calculator', href: '#' },
            { id: generateRandomId(), name: 'Risk Position Calculator', href: '#' },
            { id: generateRandomId(), name: 'Economic Calendar', href: '#' },
            { id: generateRandomId(), name: 'Brokers Spread Comparison', href: '#' },
            { id: generateRandomId(), name: 'Market Volatility', href: '#' },
            { id: generateRandomId(), name: 'Market Correlation', href: '#' },
            { id: generateRandomId(), name: 'Interest Rates', href: '#' },
        ],
    },
    { id: generateRandomId(), name: 'Charts', href: '#' },
    { id: generateRandomId(), name: 'Affiliate Program', href: '#' },
    {
        id: generateRandomId(),
        name: 'Academy',
        subItems: [
            {
                id: generateRandomId(),
                name: 'Trading Academy',
                linksList: [
                    { id: generateRandomId(), name: 'Learn Forex Trading', href: '#' },
                    { id: generateRandomId(), name: 'Learn Crypto Trading', href: '#' },
                    { id: generateRandomId(), name: 'Learn Prop Trading', href: '#' },
                ],
            },
            {
                id: generateRandomId(),
                name: 'What are',
                linksList: [
                    { id: generateRandomId(), name: 'Forex Broker', href: '#' },
                    { id: generateRandomId(), name: 'Crypto Exchange', href: '#' },
                    { id: generateRandomId(), name: 'Prop Firm', href: '#' },
                ],
            },
            { id: generateRandomId(), name: 'Crypto Exchanges', href: '#' },
            { id: generateRandomId(), name: 'Prop Firms', href: '#' },
            {
                id: generateRandomId(),
                name: 'How to Choose a',
                linksList: [
                    { id: generateRandomId(), name: 'Forex Broker', href: '#' },
                    { id: generateRandomId(), name: 'Crypto Exchange', href: '#' },
                    { id: generateRandomId(), name: 'Prop Firm', href: '#' },
                ],
            },
            {
                id: generateRandomId(),
                name: 'Financial Services Authorities',
                href: 'https://fxrebate.eu/help/financial-services-authorities',
                external: true,
            },
        ],
    },
    {
        id: generateRandomId(),
        name: 'Forum',
        subItems: [
            { id: generateRandomId(), name: 'Blogs', href: '#' },
            { id: generateRandomId(), name: 'Latest Posts', href: '#' },
            { id: generateRandomId(), name: 'Chat Room (Telegram)', href: '#', external: true },
        ],
    },
    {
        id: generateRandomId(),
        name: 'Support',
        subItems: [
            { id: generateRandomId(), name: 'About Us', href: '#' },
            {
                id: generateRandomId(),
                name: 'Legal Documents',
                linksList: [
                    { id: generateRandomId(), name: 'Terms of Service', href: '#' },
                    { id: generateRandomId(), name: 'Privacy Policy', href: '#' },
                ],
            },
            {
                id: generateRandomId(),
                name: 'Business Information',
                linksList: [
                    { id: generateRandomId(), name: 'Mission Statement', href: '#' },
                    { id: generateRandomId(), name: 'What are Rebates?', href: '#' },
                    { id: generateRandomId(), name: 'How Rebates are Paid?', href: '#' },
                    { id: generateRandomId(), name: 'Rebates - Pros & Cons', href: '#' },
                    { id: generateRandomId(), name: 'FXRebate Deal Types', href: '#' },
                    { id: generateRandomId(), name: 'FXRebate Private Deal', href: '#' },
                ],
            },
            {
                id: generateRandomId(),
                name: 'Promotions',
                linksList: [
                    { id: generateRandomId(), name: 'Forex Brokers', href: '#' },
                    { id: generateRandomId(), name: 'Crypto Exchanges', href: '#' },
                    { id: generateRandomId(), name: 'Prop Firms', href: '#' },
                ],
            },
            {
                id: generateRandomId(),
                name: 'Contests',
                linksList: [
                    { id: generateRandomId(), name: 'Forex Brokers', href: '#' },
                    { id: generateRandomId(), name: 'Crypto Exchanges', href: '#' },
                    { id: generateRandomId(), name: 'Prop Firms', href: '#' },
                ],
            },
            {
                id: generateRandomId(),
                name: 'FAQs',
                linksList: [
                    { id: generateRandomId(), name: 'Payment Information', href: '#' },
                    { id: generateRandomId(), name: 'Rebate Program', href: '#' },
                    { id: generateRandomId(), name: 'Affiliate Program', href: '#' },
                ],
            },
            { id: generateRandomId(), name: 'Help Center', href: '#' },
            { id: generateRandomId(), name: 'Contact Us', href: '#' },
            { id: generateRandomId(), name: 'Live Chat', href: '#' },
        ],
    },
];

const languages = [
    'English',
    'Greek',
    'French',
    'Polish',
    'Portuguese',
    'Dutch',
    'Turkish',
    'Malay',
    'Hungarian',
    'Italian',
    'Arabic',
    'Vietnamese',
    'Czech',
    'Hindi',
    'Simplified Chinese',
    'Russian',
    'Thai',
    'Bengali',
    'Sinhala',
    'Traditional Chinese',
    'Indonesian',
    'German',
    'Korean',
    'Spanish',
    'Filipino',
    'Urdu',
    'Uzbek',
];

export const languageItems = Array.from({ length: languages.length }, () => {
    const id = generateRandomId();
    const name = languages.shift();
    const icon = '/assets/icons/us.svg';
    const code = name ? name.slice(0, 2).toUpperCase() : '';
    return { id, name, flagIcon: icon, code };
});

export const socialItems = [
    {
        id: 1,
        name: 'LinkedIn',
        href: '#',
        icon: <SlSocialLinkedin className="text-xl transition-all duration-200 hover:text-accent" />,
    },
    {
        id: 2,
        name: 'Instagram',
        href: '#',
        icon: <SlSocialInstagram className="text-xl transition-all duration-200 hover:text-accent" />,
    },
    {
        id: 3,
        name: 'Facebook',
        href: '#',
        icon: <SlSocialFacebook className="text-xl transition-all duration-200 hover:text-accent" />,
    },
    {
        id: 4,
        name: 'Twitter',
        href: '#',
        icon: <SlSocialTwitter className="text-xl transition-all duration-200 hover:text-accent" />,
    },
    {
        id: 5,
        name: 'Telegram',
        href: '#',
        icon: <FaTelegramPlane className="text-xl transition-all duration-200 hover:text-accent" />,
    },
];

export const companyStats = {
    title: 'FXRebate in Numbers: Proven Success, Real Rewards',
    stats: [
        { id: generateRandomId(), num: 8, nextSuffix: 'K+', subheading: 'Active Clients' },
        { id: generateRandomId(), num: 20, nextSuffix: '+ Years', subheading: 'Experience in Financial Markets' },
        { id: generateRandomId(), num: 5, prevSuffix: '$', nextSuffix: 'Million+', subheading: 'Paid in Rebates' },
        {
            id: generateRandomId(),
            num: 500,
            prevSuffix: '$',
            nextSuffix: 'K+',
            subheading: 'Paid in Affiliate Commissions',
        },
    ],
};

export const ourPartners = {
    title: 'FXRebate partners',
    items: [
        { id: generateRandomId(), name: 'FBS', href: '#', lightIcon: '/assets/partners/FBS-light.webp' },
        { id: generateRandomId(), name: 'Fortrade', href: '#', lightIcon: '/assets/partners/Fortrade-light.webp' },
        {
            id: generateRandomId(),
            name: 'LandPrime',
            href: '#',
            lightIcon: '/assets/partners/LandPrime-dark.webp',
            darkIcon: '/assets/partners/LandPrime-light.webp',
        },
        {
            id: generateRandomId(),
            name: 'M4Markets',
            href: '#',
            lightIcon: '/assets/partners/M4Markets-dark.webp',
            darkIcon: '/assets/partners/M4Markets-light.webp',
        },
        { id: generateRandomId(), name: 'TickMill', href: '#', lightIcon: '/assets/partners/TickMill-light.webp' },
        { id: generateRandomId(), name: 'TopFX', href: '#', lightIcon: '/assets/partners/TopFX-light.webp' },
    ],
};

export const ourPaymentMethods = {
    title: 'FXRebate Payment Options',
    methods: [
        { id: generateRandomId(), name: 'Skrill', href: '#', lightIcon: '/assets/payments/skrill.webp' },
        {
            id: generateRandomId(),
            name: 'Bank',
            href: '#',
            lightIcon: '/assets/payments/Bank-dark.webp',
            darkIcon: '/assets/payments/Bank-light.webp',
        },
        {
            id: generateRandomId(),
            name: 'Bitcoin',
            href: '#',
            lightIcon: '/assets/payments/dark-bitcoin.webp',
            darkIcon: '/assets/payments/light-bitcoin.webp',
        },
        {
            id: generateRandomId(),
            name: 'Ethereum',
            href: '#',
            lightIcon: '/assets/payments/Ethereum-dark.webp',
            darkIcon: '/assets/payments/Ethereum-light.webp',
        },
        { id: generateRandomId(), name: 'PayPal', href: '#', lightIcon: '/assets/payments/paypal.webp' },
        { id: generateRandomId(), name: 'Tether', href: '#', lightIcon: '/assets/payments/Tether-light.webp' },
    ],
};

export const whyUs = {
    title: 'Why Us',
    description:
        'Our platform stands out with a robust set of features designed to deliver unmatched value, flexibility, and reliability.',
    features: [
        {
            id: generateRandomId(),
            darkBgImage: '/assets/whyUs/dark-cup.webp',
            lightBgImage: '/assets/whyUs/light-cup.webp',
            title: 'Price Leadership',
            description: 'At FXRebate, we pride ourselves on delivering the best value in the market.',
        },
        {
            id: generateRandomId(),
            darkBgImage: '/assets/whyUs/dark-stairs.webp',
            lightBgImage: '/assets/whyUs/light-stairs.webp',
            title: 'Multi-Tier Value',
            description:
                'FXRebate has a structured rewards system that benefits traders, affiliates, and partners at multiple levels. This model ensures sustainable earnings and long-term engagement by creating value across different tiers of participation.',
        },
        {
            id: generateRandomId(),
            darkBgImage: '/assets/whyUs/dark-hand.webp',
            lightBgImage: '/assets/whyUs/light-hand.webp',
            title: 'Service Excellence',
            description:
                'At FXRebate, we prioritize delivering an exceptional experience for our users through robust, reliable, and professional services.',
        },
        {
            id: generateRandomId(),
            darkBgImage: '/assets/whyUs/dark-shield.webp',
            lightBgImage: '/assets/whyUs/light-shield.webp',
            title: 'Trust & Credibility',
            description: 'At FXRebate, trust and credibility are the foundation of our business.',
        },
    ],
};

export const whyJoinUs = [
    {
        id: generateRandomId(),
        title: 'Your Best Partner for Maximum Cashback',
        description:
            "Joining FXRebate means gaining access to the most rewarding, reliable, and customer-focused rebate platform available. Here's what sets us apart:",
        className: 'dark:text-white dark:bg-black text-black bg-white',
        tagContent: (
            <>
                <Image src="/assets/icons/whyJoinUs.svg" alt="tag" width={16} height={16} />
                <span className="text-sm font-medium text-white">Why join us</span>
            </>
        ),
    },
    {
        id: generateRandomId(),
        title: 'Best rate guarantee',
        description:
            'Earn money back on every trade through our reliable network of top-rated brokers, crypto exchanges and prop firms. Your cashback is deposited directly into your FXRebate Wallet or to your Trading Account, providing you with consistent, hassle-free rewards for every transaction. With FXRebate, every trade truly matters.',
        className: 'dark:text-white dark:bg-dark-green-200 text-black bg-white-200',
    },
    {
        id: generateRandomId(),
        title: 'Best affiliate network',
        description:
            'Earn more with FXRebate’s 3-tier affiliate program! Get rewarded not just for your referrals, but also for their referrals—up to a total of 12.5% in commissions.',
        className: 'dark:bg-white text-black bg-[#FBFBFB]',
        button: {
            text: 'Join the affiliate network',
            iconImage: '/assets/icons/arrow-right.svg',
            href: '#',
        },
    },
    {
        id: generateRandomId(),
        title: 'Access to the industry-leading trading tools',
        description:
            'Gain access to cutting-edge trading tools designed to enhance your strategy and performance. From advanced analytics to automated solutions, our industry-leading tools empower traders with precision, efficiency, and a competitive edge.',
        className: 'dark:text-white dark:bg-black text-black bg-white-200',
        button: {
            text: 'View all tools',
            iconImage: '/assets/icons/arrow-right.svg',
            href: '#',
        },
    },
    {
        id: generateRandomId(),
        title: 'Superb 24-hour support',
        description:
            'Friendly and knowledgeable support from professionals’ traders. Our support staff are professionals with more than 20 years of experience in financial markets. We are there for you via phone, chat or email.',
        className: 'dark:bg-white text-black bg-[#FBFBFB]',
        button: {
            text: 'Contact us',
            iconImage: '/assets/icons/arrow-right.svg',
            href: '#',
        },
    },
];

export const testimonials = {
    title: 'Trusted by Thousands of Traders Worldwide',
    items: [
        {
            id: generateRandomId(),
            name: 'John Doe',
            videoSrc: '/',
            userImage: '/assets/users/user.webp',
            date: '12 Dec, 2024',
            rating: '5.0 Review',
            quote: 'Lorem ipsum dolor sit amet consectetur. Commodo lobortis quam dignissim massa venenatis. Auctor molestie sit orci id ipsum. Pharetra tincidunt imperdiet pellentesque amet. Duis ultrices dui pharetra arcu. Tortor ante vestibulum auctor lacus dictum enim.',
        },
        {
            id: generateRandomId(),
            name: 'Emily Clark',
            videoSrc: '/',
            userImage: '/assets/users/user.webp',
            date: '12 Dec, 2024',
            rating: '5.0 Review',
            quote: 'Sit etiam quam lorem dui tortor facilisis. Amet mi velit dui cursus quis in vitae quisque non.',
        },
        {
            id: generateRandomId(),
            name: 'Alice Smith',
            videoSrc: '/',
            userImage: '/assets/users/user.webp',
            date: '12 Dec, 2024',
            rating: '5.0 Review',
            quote: 'Lorem ipsum dolor sit amet consectetur. Commodo lobortis quam dignissim massa venenatis. Auctor molestie sit orci id ipsum. Pharetra tincidunt imperdiet pellentesque amet. Duis ultrices dui pharetra arcu. Tortor ante vestibulum auctor lacus dictum enim.',
        },
        {
            id: generateRandomId(),
            name: 'Bob Johnson',
            videoSrc: '/',
            userImage: '/assets/users/user.webp',
            date: '12 Dec, 2024',
            rating: '5.0 Review',
            quote: 'Sit etiam quam lorem dui tortor facilisis. Amet mi velit dui cursus quis in vitae quisque non.',
        },
        {
            id: generateRandomId(),
            name: 'Charlie Brown',
            videoSrc: '/',
            userImage: '/assets/users/user.webp',
            date: '12 Dec, 2024',
            rating: '5.0 Review',
            quote: 'Lorem ipsum dolor sit amet consectetur. Commodo lobortis quam dignissim massa venenatis. Auctor molestie sit orci id ipsum. Pharetra tincidunt imperdiet pellentesque amet. Duis ultrices dui pharetra arcu. Tortor ante vestibulum auctor lacus dictum enim.',
        },
        {
            id: generateRandomId(),
            name: 'Diana Prince',
            videoSrc: '/',
            userImage: '/assets/users/user.webp',
            date: '12 Dec, 2024',
            rating: '5.0 Review',
            quote: 'Sit etiam quam lorem dui tortor facilisis. Amet mi velit dui cursus quis in vitae quisque non.',
        },
    ],
};

export const footerContent = {
    disclaimer:
        'It is possible that you can lose all of the money you deposit, and in some circumstance you may even be required to deposit additional sums to cover you loses. By undertaking these types of high risk trades you acknowledge that you are trading with your available risk capital and any losses you may incur will not adversely affect your lifestyle. The high degree of leverage can work against you as well as for you. You must be aware of the risks of investing in forex, futures, and options and be willing to accept them in order to trade in these markets. Forex trading involves substantial risk of loss and is not suitable for all investors. Please do not trade with borrowed money or money you cannot afford to lose. This website is neither a solicitation nor an offer to Buy or Sell currencies, futures, or options. No representation is being made that any account will or is likely to achieve profits or losses similar to those discussed on this website. Any opinions, news, research, analysis, prices, or other information contained on this website is provided as general market commentary and does not constitute investment advice. Website owners and affiliates will not accept liability for any loss or damage, including without limitation to, any loss of profit, which may arise directly or indirectly from the use of or reliance on such information. Please remember that the past performance of any trading system or methodology is not necessarily indicative of future results. Trading foreign exchange, commodity futures, options, precious metals and other over-the-counter or no-exchange products carries a high level of risk and may not be suitable for all investors.',
    navItems: [
        {
            title: 'Main',
            items: [
                { name: 'Forex Brokers', href: '#' },
                { name: 'Crypto Exchanges', href: '#' },
                { name: 'Prop Firms', href: '#' },
                { name: 'Affiliate Program', href: '#' },
            ],
        },
        {
            title: 'Tools & Education',
            items: [
                { name: 'Trading Academy', href: '#' },
                { name: 'Trading Tools', href: '#' },
                { name: 'Charts', href: '#' },
                { name: 'Blog', href: '#' },
                { name: 'Telegram', href: '#' },
            ],
        },
        {
            title: 'Company information',
            items: [
                { name: 'About us', href: '#' },
                { name: 'Contact', href: '#' },
                { name: 'Help Center', href: '#' },
                { name: 'Terms of Service', href: '#' },
                { name: 'Privacy Policy', href: '#' },
            ],
        },
    ],
};
