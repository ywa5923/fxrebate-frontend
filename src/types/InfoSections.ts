export type InfoSection = {
    id?: number
    title: string
    subtitle?: string|null
    description?: string|null
    published?: boolean
    items?: InfoSectionItem[]
}

export type InfoSectionItem = {
    id?: number
    info_section_id?: number
    title: string
    subtitle?: string|null
    description?: string|null
    published?: boolean
}