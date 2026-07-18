import { Search } from "lucide-react";

import type { EpisodeSearchFilters } from "../domain/search";
import { de } from "../i18n/de";

interface FilterBarProps {
  filters: EpisodeSearchFilters;
  checkers: string[];
  topics: string[];
  onChange: (filters: EpisodeSearchFilters) => void;
}

export function FilterBar({ filters, checkers, topics, onChange }: FilterBarProps) {
  return (
    <form className="filter-bar" role="search" onSubmit={(event) => event.preventDefault()}>
      <label className="search-field">
        <span>{de.search.title}</span>
        <Search aria-hidden="true" size={18} />
        <input
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder={de.search.placeholder}
          type="search"
        />
      </label>
      <label>
        <span>{de.common.checker}</span>
        <select
          value={filters.checker}
          onChange={(event) => onChange({ ...filters, checker: event.target.value })}
        >
          <option value="">{de.common.all}</option>
          {checkers.map((checker) => (
            <option key={checker} value={checker}>
              {checker}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{de.common.topic}</span>
        <select
          value={filters.topic}
          onChange={(event) => onChange({ ...filters, topic: event.target.value })}
        >
          <option value="">{de.common.all}</option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
