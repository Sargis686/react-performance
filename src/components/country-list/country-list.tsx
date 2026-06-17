import { useMemo } from 'react';
import { List } from 'react-window';
import type { RowComponentProps } from 'react-window';

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

type CountryWithYearDataMap = Country & {
  yearDataMap: ReturnType<typeof createYearDataMap>;
};

type CountryRowProps = {
  countries: CountryWithYearDataMap[];
  selectedColumns: string[];
  selectedYear: number;
};

const CountryRow = ({
  ariaAttributes,
  countries,
  index,
  selectedColumns,
  selectedYear,
  style,
}: RowComponentProps<CountryRowProps>) => {
  const country = countries[index];

  if (!country) {
    return null;
  }

  return (
    <div {...ariaAttributes} style={style}>
      <CountryCard
        country={country}
        selectedYear={selectedYear}
        selectedColumns={selectedColumns}
      />
    </div>
  );
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
      .filter((country) => {
        const matchesSearch = country.id
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        const matchesRegion =
          !selectedRegion ||
          country.data.some((data) => data.region === selectedRegion);

        return matchesSearch && matchesRegion;
      })
      .sort((a, b) => {
        if (sortField === 'name') {
          return sortOrder === 'asc'
            ? a.id.localeCompare(b.id)
            : b.id.localeCompare(a.id);
        }

        const popA = getPopulationForYear(a.yearDataMap, selectedYear) || 0;
        const popB = getPopulationForYear(b.yearDataMap, selectedYear) || 0;

        return sortOrder === 'asc' ? popA - popB : popB - popA;
      });
  }, [
    countriesWithMap,
    searchQuery,
    selectedRegion,
    selectedYear,
    sortField,
    sortOrder,
  ]);

  const rowProps = useMemo(
    () => ({
      countries: filteredCountries,
      selectedColumns,
      selectedYear,
    }),
    [filteredCountries, selectedColumns, selectedYear],
  );

  return (
    <div className={styles.countryList}>
      <List
        style={{ height: 700, width: '100%' }}
        rowCount={filteredCountries.length}
        rowHeight={320}
        rowComponent={CountryRow}
        rowProps={rowProps}
      />
    </div>
  );
};