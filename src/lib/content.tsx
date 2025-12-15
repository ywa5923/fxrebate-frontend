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
        name: 'home',
        href: '/',
        lightIcon: '/assets/icons/homeIcon-light.svg',
        darkIcon: '/assets/icons/homeIcon-dark.svg',
    },
    {
        id: generateRandomId(),
        name: 'brokers',
        subItems: [
            // {
            //     id: generateRandomId(),
            //     name: 'forex_brokers',
            //     itemsList: [
            //         { id: generateRandomId(), brokerName: '4XC', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         { id: generateRandomId(), brokerName: 'AAFX', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         { id: generateRandomId(), brokerName: 'Amana', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         { id: generateRandomId(), brokerName: 'AvaTrade', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         { id: generateRandomId(), brokerName: 'Axi', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         { id: generateRandomId(), brokerName: 'Axiory', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         {
            //             id: generateRandomId(),
            //             brokerName: 'BlackBull Markets',
            //             brokerLogo: '/assets/FbsBroker.png',
            //             href: '#',
            //         },
            //         { id: generateRandomId(), brokerName: 'Errante', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         {
            //             id: generateRandomId(),
            //             brokerName: 'Exclusive Markets',
            //             brokerLogo: '/assets/FbsBroker.png',
            //             href: '#',
            //         },
            //         { id: generateRandomId(), brokerName: 'Exness', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         {
            //             id: generateRandomId(),
            //             brokerName: 'FIBO Group',
            //             brokerLogo: '/assets/FbsBroker.png',
            //             href: '#',
            //         },
            //         { id: generateRandomId(), brokerName: 'FINVEO', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         { id: generateRandomId(), brokerName: 'ForexMart', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         { id: generateRandomId(), brokerName: 'FxPro', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         { id: generateRandomId(), brokerName: 'FXTM', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         { id: generateRandomId(), brokerName: 'Fxview', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         {
            //             id: generateRandomId(),
            //             brokerName: 'Global Prime',
            //             brokerLogo: '/assets/FbsBroker.png',
            //             href: '#',
            //         },
            //         {
            //             id: generateRandomId(),
            //             brokerName: 'GO Markets',
            //             brokerLogo: '/assets/FbsBroker.png',
            //             href: '#',
            //         },
            //         {
            //             id: generateRandomId(),
            //             brokerName: 'GM Markets',
            //             brokerLogo: '/assets/FbsBroker.png',
            //             href: '#',
            //         },
            //         {
            //             id: generateRandomId(),
            //             brokerName: 'InstaForex',
            //             brokerLogo: '/assets/FbsBroker.png',
            //             href: '#',
            //         },
            //         {
            //             id: generateRandomId(),
            //             brokerName: 'Key to Markets',
            //             brokerLogo: '/assets/FbsBroker.png',
            //             href: '#',
            //         },
            //         {
            //             id: generateRandomId(),
            //             brokerName: 'Lime Prime',
            //             brokerLogo: '/assets/FbsBroker.png',
            //             href: '#',
            //         },
            //         { id: generateRandomId(), brokerName: 'LMFX', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         { id: generateRandomId(), brokerName: 'M4Markets', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         {
            //             id: generateRandomId(),
            //             brokerName: 'Markets.com',
            //             brokerLogo: '/assets/FbsBroker.png',
            //             href: '#',
            //         },
            //         { id: generateRandomId(), brokerName: 'Naga', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         { id: generateRandomId(), brokerName: 'NordFX', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         { id: generateRandomId(), brokerName: 'OneRoyal', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         { id: generateRandomId(), brokerName: 'PU Prime', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         {
            //             id: generateRandomId(),
            //             brokerName: 'Scope Markets',
            //             brokerLogo: '/assets/FbsBroker.png',
            //             href: '#',
            //         },
            //         { id: generateRandomId(), brokerName: 'Skilling', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         {
            //             id: generateRandomId(),
            //             brokerName: 'Saxo Markets',
            //             brokerLogo: '/assets/FbsBroker.png',
            //             href: '#',
            //         },
            //         { id: generateRandomId(), brokerName: 'SMFX', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         { id: generateRandomId(), brokerName: 'TickMill', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         { id: generateRandomId(), brokerName: 'TopFX', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         { id: generateRandomId(), brokerName: 'TradeMax', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         {
            //             id: generateRandomId(),
            //             brokerName: 'Traders Trust',
            //             brokerLogo: '/assets/FbsBroker.png',
            //             href: '#',
            //         },
            //         {
            //             id: generateRandomId(),
            //             brokerName: 'Trust Capital',
            //             brokerLogo: '/assets/FbsBroker.png',
            //             href: '#',
            //         },
            //         {
            //             id: generateRandomId(),
            //             brokerName: 'VT Markets',
            //             brokerLogo: '/assets/FbsBroker.png',
            //             href: '#',
            //         },
            //         { id: generateRandomId(), brokerName: 'XM', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         { id: generateRandomId(), brokerName: 'XTB', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         {
            //             id: generateRandomId(),
            //             brokerName: 'ThinkMarkets',
            //             brokerLogo: '/assets/FbsBroker.png',
            //             href: '#',
            //         },
            //         { id: generateRandomId(), brokerName: 'TitanFX', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         {
            //             id: generateRandomId(),
            //             brokerName: 'TIOmarkets',
            //             brokerLogo: '/assets/FbsBroker.png',
            //             href: '#',
            //         },
            //         {
            //             id: generateRandomId(),
            //             brokerName: 'Solidary Markets',
            //             brokerLogo: '/assets/FbsBroker.png',
            //             href: '#',
            //         },
            //         {
            //             id: generateRandomId(),
            //             brokerName: 'SquaredFinancial',
            //             brokerLogo: '/assets/FbsBroker.png',
            //             href: '#',
            //         },
            //         {
            //             id: generateRandomId(),
            //             brokerName: 'Startrader',
            //             brokerLogo: '/assets/FbsBroker.png',
            //             href: '#',
            //         },
            //         {
            //             id: generateRandomId(),
            //             brokerName: 'Thunder Forex',
            //             brokerLogo: '/assets/FbsBroker.png',
            //             href: '#',
            //         },
            //         { id: generateRandomId(), brokerName: 'T4Trade', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         { id: generateRandomId(), brokerName: 'TMGM', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         { id: generateRandomId(), brokerName: 'TeraFX', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         { id: generateRandomId(), brokerName: 'Tradeview', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         {
            //             id: generateRandomId(),
            //             brokerName: 'Trust Capital TC',
            //             brokerLogo: '/assets/FbsBroker.png',
            //             href: '#',
            //         },
            //         {
            //             id: generateRandomId(),
            //             brokerName: 'VT Markets',
            //             brokerLogo: '/assets/FbsBroker.png',
            //             href: '#',
            //         },
            //         { id: generateRandomId(), brokerName: 'XM', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //         { id: generateRandomId(), brokerName: 'XTB', brokerLogo: '/assets/FbsBroker.png', href: '#' },
            //     ],
            // },
            {
                id: generateRandomId(),
                name: 'forex_brokers_list',
                href: '/brokers',
                external: true,
            },
            { id: generateRandomId(), name: 'ratings_reviews', href: '#' },
            { id: generateRandomId(), name: 'guides', href: '#' },
            { id: generateRandomId(), name: 'best_brokers_2025', href: '#' },
            { id: generateRandomId(), name: 'brokers_promotions', href: '#' },
            { id: generateRandomId(), name: 'brokers_contests', href: '#' },
        ],
    },
    {
        id: generateRandomId(),
        name: 'crypto',
        subItems: [
            { id: generateRandomId(), name: 'crypto_exchanges', href: '#' },
            { id: generateRandomId(), name: 'crypto_exchanges_list', href: '#' },
            { id: generateRandomId(), name: 'ratings_reviews', href: '#' },
            { id: generateRandomId(), name: 'guides', href: '#' },
            { id: generateRandomId(), name: 'best_exchanges_2025', href: '#' },
            { id: generateRandomId(), name: 'exchanges_promotions', href: '#' },
            { id: generateRandomId(), name: 'exchanges_contests', href: '#' },
        ],
    },
    {
        id: generateRandomId(),
        name: 'props',
        subItems: [
            { id: generateRandomId(), name: 'prop_firms', href: '#' },
            { id: generateRandomId(), name: 'prop_firms_list', href: '#' },
            { id: generateRandomId(), name: 'ratings_reviews', href: '#' },
            { id: generateRandomId(), name: 'guides', href: '#' },
            { id: generateRandomId(), name: 'best_prop_firms_2025', href: '#' },
            { id: generateRandomId(), name: 'prop_firms_promotions', href: '#' },
            { id: generateRandomId(), name: 'prop_irms_contests', href: '#' },
        ],
    },
    {
        id: generateRandomId(),
        name: 'tools',
        subItems: [
            { id: generateRandomId(), name: 'currency_converter', href: '#' },
            { id: generateRandomId(), name: 'fibonacci_calculator', href: '#' },
            { id: generateRandomId(), name: 'margin_calculator', href: '#' },
            { id: generateRandomId(), name: 'pip_calculator', href: '#' },
            { id: generateRandomId(), name: 'pivot_point_calculator', href: '#' },
            { id: generateRandomId(), name: 'risk_position_calculator', href: '#' },
            { id: generateRandomId(), name: 'economic_calendar', href: '#' },
            { id: generateRandomId(), name: 'brokers_spread_comparison', href: '#' },
            { id: generateRandomId(), name: 'market_volatility', href: '#' },
            { id: generateRandomId(), name: 'market_correlation', href: '#' },
            { id: generateRandomId(), name: 'interest_rates', href: '#' },
        ],
    },
    { id: generateRandomId(), name: 'charts', href: '#' },
    { id: generateRandomId(), name: 'affiliate_program', href: '#' },
    {
        id: generateRandomId(),
        name: 'academy',
        subItems: [
            {
                id: generateRandomId(),
                name: 'trading_academy',
                linksList: [
                    { id: generateRandomId(), name: 'learn_forex_trading', href: '#' },
                    { id: generateRandomId(), name: 'learn_crypto_trading', href: '#' },
                    { id: generateRandomId(), name: 'learn_prop_trading', href: '#' },
                ],
            },
            {
                id: generateRandomId(),
                name: 'what_are',
                linksList: [
                    { id: generateRandomId(), name: 'forex_broker', href: '#' },
                    { id: generateRandomId(), name: 'crypto_exchange', href: '#' },
                    { id: generateRandomId(), name: 'prop_firm', href: '#' },
                ],
            },
            { id: generateRandomId(), name: 'crypto_exchanges', href: '#' },
            { id: generateRandomId(), name: 'prop_firms', href: '#' },
            {
                id: generateRandomId(),
                name: 'how_to_choose_a',
                linksList: [
                    { id: generateRandomId(), name: 'forex_broker', href: '#' },
                    { id: generateRandomId(), name: 'crypto_exchange', href: '#' },
                    { id: generateRandomId(), name: 'prop_firm', href: '#' },
                ],
            },
            {
                id: generateRandomId(),
                name: 'financial_services_authorities',
                href: 'https://fxrebate.eu/help/financial-services-authorities',
                external: true,
            },
        ],
    },
    {
        id: generateRandomId(),
        name: 'forum',
        subItems: [
            { id: generateRandomId(), name: 'blogs', href: '#' },
            { id: generateRandomId(), name: 'latest_posts', href: '#' },
            { id: generateRandomId(), name: 'chat_room_(telegram)', href: '#', external: true },
        ],
    },
    {
        id: generateRandomId(),
        name: 'support',
        subItems: [
            { id: generateRandomId(), name: 'about_us', href: '#' },
            {
                id: generateRandomId(),
                name: 'legal_documents',
                linksList: [
                    { id: generateRandomId(), name: 'terms_of_service', href: '#' },
                    { id: generateRandomId(), name: 'privacy_policy', href: '#' },
                ],
            },
            {
                id: generateRandomId(),
                name: 'business_information',
                linksList: [
                    { id: generateRandomId(), name: 'mission_statement', href: '#' },
                    { id: generateRandomId(), name: 'what_are_rebates?', href: '#' },
                    { id: generateRandomId(), name: 'how_rebates_are_paid?', href: '#' },
                    { id: generateRandomId(), name: 'rebates_pros_&_cons', href: '#' },
                    { id: generateRandomId(), name: 'FXRebate_deal_types', href: '#' },
                    { id: generateRandomId(), name: 'FXRebate_private_deal', href: '#' },
                ],
            },
            {
                id: generateRandomId(),
                name: 'promotions',
                linksList: [
                    { id: generateRandomId(), name: 'forex_brokers', href: '#' },
                    { id: generateRandomId(), name: 'crypto_exchanges', href: '#' },
                    { id: generateRandomId(), name: 'prop_firms', href: '#' },
                ],
            },
            {
                id: generateRandomId(),
                name: 'contests',
                linksList: [
                    { id: generateRandomId(), name: 'forex_brokers', href: '#' },
                    { id: generateRandomId(), name: 'crypto_exchanges', href: '#' },
                    { id: generateRandomId(), name: 'prop_firms', href: '#' },
                ],
            },
            {
                id: generateRandomId(),
                name: 'faqs',
                linksList: [
                    { id: generateRandomId(), name: 'payment_information', href: '#' },
                    { id: generateRandomId(), name: 'rebate_program', href: '#' },
                    { id: generateRandomId(), name: 'affiliate_program', href: '#' },
                ],
            },
            { id: generateRandomId(), name: 'help_center', href: '#' },
            { id: generateRandomId(), name: 'contact_us', href: '#' },
            { id: generateRandomId(), name: 'live_chat', href: '#' },
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
    title: 'company_stats_title',
    stats: [
        { id: generateRandomId(), num: 8, nextSuffix: 'K+', subheading: 'active_clients' },
        { id: generateRandomId(), num: 20, nextSuffix: '+_years', subheading: 'experience_in_financial_markets' },
        { id: generateRandomId(), num: 5, prevSuffix: '$', nextSuffix: 'million_+', subheading: 'paid_in_rebates' },
        {
            id: generateRandomId(),
            num: 500,
            prevSuffix: '$',
            nextSuffix: 'K+',
            subheading: 'paid_in_affiliate_commissions',
        },
    ],
};

export const ourPartners = {
    title: 'FXRebate_partners',
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
    title: 'payment_options',
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
    title: 'why_us',
    description:'why_us_header',
        
    features: [
        {
            id: generateRandomId(),
            darkBgImage: '/assets/whyUs/dark-cup.webp',
            lightBgImage: '/assets/whyUs/light-cup.webp',
            title: 'why_us_t',
            description: 'why_us_d',
        },
        {
            id: generateRandomId(),
            darkBgImage: '/assets/whyUs/dark-stairs.webp',
            lightBgImage: '/assets/whyUs/light-stairs.webp',
            title: 'why_us_t1',
            description:'why_us_d1', 
        },
        {
            id: generateRandomId(),
            darkBgImage: '/assets/whyUs/dark-hand.webp',
            lightBgImage: '/assets/whyUs/light-hand.webp',
            title: 'why_us_t2',
            description: 'why_us_d2',
               
        },
        {
            id: generateRandomId(),
            darkBgImage: '/assets/whyUs/dark-shield.webp',
            lightBgImage: '/assets/whyUs/light-shield.webp',
            title: 'why_us_t3',
            description: 'why_us_d3',
        },
    ],
};

export const whyJoinUs = [
    {
        id: generateRandomId(),
        title: 'why_join_us_t1',
        description:'why_join_us_d1',   
        className: 'dark:text-white dark:bg-black text-black bg-white',
        tagContent:'why_join_us'
    },
    {
        id: generateRandomId(),
        title: 'why_join_us_t2',
        description:'why_join_us_d2',
        className: 'dark:text-white dark:bg-dark-green-200 text-black bg-white-200',
    },
    {
        id: generateRandomId(),
        title: 'why_join_us_t3',
        description:'why_join_us_d3',
        className: 'dark:bg-white text-black bg-[#FBFBFB]',
        button: {
            text: 'btn_join_the_aff_network',
            iconImage: '/assets/icons/arrow-right.svg',
            href: '#',
        },
    },
    {
        id: generateRandomId(),
        title: 'why_join_us_t4',
        description: 'why_join_us_d4',
        className: 'dark:text-white dark:bg-black text-black bg-white-200',
        button: {
            text: 'btn_view_all_tools',
            iconImage: '/assets/icons/arrow-right.svg',
            href: '#',
        },
    },
    {
        id: generateRandomId(),
        title: 'why_join_us_t5',
        description:'why_join_us_d5',
        className: 'dark:bg-white text-black bg-[#FBFBFB]',
        button: {
            text: 'btn_contact_us',
            iconImage: '/assets/icons/arrow-right.svg',
            href: '#',
        },
    },
];

export const testimonials = {
    title: 'testimonials_title',
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
