
import { create } from "zustand";


type CurrencyOption = { value: string; label: string };

type CurrenciesStore = {
  currencies: CurrencyOption[];
  categories: any[];
  defaultCategories: any[];
  selectedCategory: any;
  setCurrencies: (currencies: CurrencyOption[]) => void;
  clearCurrencies: () => void;
  setCategories: (categories: any[]) => void;
  clearCategories: () => void;
  setDefaultCategories: (defaultCategories: any[]) => void;
  clearDefaultCategories: () => void;
  setSelectedCategory: (selectedCategory: any) => void;
  clearSelectedCategory: () => void;
};

export const useCurrenciesStore = create<CurrenciesStore>((set) => ({
  currencies: [],
  categories:[],
  defaultCategories:[],
  selectedCategory:undefined,
  setCurrencies: (currencies) => set({ currencies }),
  clearCurrencies: () => set({ currencies: [] }),
  setCategories: (categories) => set({ categories }),
  clearCategories: () => set({ categories: [] }),
  setDefaultCategories: (defaultCategories) => set({ defaultCategories }),
  clearDefaultCategories: () => set({ defaultCategories: [] }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  clearSelectedCategory: () => set({ selectedCategory: undefined }),
}));
