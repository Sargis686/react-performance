import { useMemo } from 'react';
import type { Country } from '../../types';

import {
  getPopulationForYear,
  createYearDataMap,
} from '../../utils/data-transformers';

import { CountryCard } from '../country-card/country-card';

import styles from './country-list.module.css';

type CountryListProps = {
  countries: Country[];
  searchQuery: string;
  selectedColumns: string[];
  selectedRegion: string;
  selectedYear: number;
  sortField: 'name' | 'population';
  sortOrder: 'asc' | 'desc';
  onYearChange: (year: number) => void;
};

export const CountryList = ({
  countries,
  searchQuery,
  selectedColumns,
  selectedRegion,
  selectedYear,
  sortField,
  sortOrder,
}: CountryListProps) => {


  const countriesWithMap = useMemo(() => {
    return countries.map((country) => ({
      ...country,
      yearDataMap: createYearDataMap(country.data),
    }));
  }, [countries]);


  const filteredCountries = useMemo(() => {
    return countriesWithMap
      .filter((c) => {
        const matchesSearch = c.id
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        const matchesRegion =
          !selectedRegion ||
          c.data.some((d) => d.region === selectedRegion);

        return matchesSearch && matchesRegion;
      })
      .sort((a, b) => {

        if (sortField === 'name') {
          return sortOrder === 'asc'
            ? a.id.localeCompare(b.id)
            : b.id.localeCompare(a.id);
        }


        const popA =
          getPopulationForYear(
            a.yearDataMap,
            selectedYear
          ) || 0;


        const popB =
          getPopulationForYear(
            b.yearDataMap,
            selectedYear
          ) || 0;


        return sortOrder === 'asc'
          ? popA - popB
          : popB - popA;
      });

  }, [
    countriesWithMap,
    searchQuery,
    selectedRegion,
    selectedYear,
    sortField,
    sortOrder,
  ]);


  return (
    <div className={styles.countryList}>
      {filteredCountries.map((country) => (
        <CountryCard
          key={country.id}
          country={country}
          selectedYear={selectedYear}
          selectedColumns={selectedColumns}
        />
      ))}
    </div>
  );
};