"use client";
import React from 'react'
import { useTranslation } from '@/components/providers/translations'
import { Translations } from '@/components/providers/translations';

const MyComponent = () => {
  const t:Translations = useTranslation();

  return (
    <div>{t.main_header}</div>
  )
}

export default MyComponent