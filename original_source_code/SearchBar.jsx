import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  Tag,
  Folder,
  FileText,
  Youtube,
  BookOpen,
  Globe
} from 'lucide-react'
import { useResources, useSpaces, useClassifications } from '../hooks/useSupabase'

export const SearchBar = ({ onSearch, onFilterChange, filters }) => {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef(null)
  
  const { searchResources } = useResources()
  const { spaces } = useSpaces()
  const { classifications } = useClassifications()

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      onSearch([])
      return
    }

    setIsSearching(true)
    const { data, error } = await searchResources(searchQuery)
    
    if (!error) {
      setSearchResults(data)
      onSearch(data)
    }
    
    setIsSearching(false)
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value)
    }, 300)
  }

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters }
    
    if (filterType === 'type' || filterType === 'space' || filterType === 'classification') {
      if (newFilters[filterType]?.includes(value)) {
        newFilters[filterType] = newFilters[filterType].filter(item => item !== value)
      } else {
        newFilters[filterType] = [...(newFilters[filterType] || []), value]
      }
    } else {
      newFilters[filterType] = value
    }
    
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    onFilterChange({})
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'youtube': return <Youtube className="w-4 h-4 text-red-500" />
      case 'book': return <BookOpen className="w-4 h-4 text-blue-500" />
      case 'article': return <Globe className="w-4 h-4 text-green-500" />
      default: return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  const activeFilterCount = Object.values(filters).flat().filter(Boolean).length

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search your knowledge base..."
            value={query}
            onChange={handleInputChange}
            className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowFilters(!showFilters)}
          className={activeFilterCount > 0 ? 'bg-blue-50 border-blue-300' : ''}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Filters</h3>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear all
                </Button>
              )}
            </div>

            {/* Resource Type Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Resource Type</label>
              <div className="flex flex-wrap gap-2">
                {['youtube', 'book', 'article'].map(type => (
                  <Button
                    key={type}
                    variant={filters.type?.includes(type) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('type', type)}
                    className="capitalize"
                  >
                    {getTypeIcon(type)}
                    <span className="ml-2">{type}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Space Filter */}
            {spaces.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Spaces</label>
                <div className="flex flex-wrap gap-2">
                  {spaces.map(space => (
                    <Button
                      key={space.id}
                      variant={filters.space?.includes(space.id) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('space', space.id)}
                    >
                      <Folder className="w-4 h-4 mr-2" style={{ color: space.color }} />
                      {space.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Classification Filter */}
            {classifications.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Classifications</label>
                <div className="flex flex-wrap gap-2">
                  {classifications.slice(0, 6).map(classification => (
                    <Button
                      key={classification.id}
                      variant={filters.classification?.includes(classification.id) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('classification', classification.id)}
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      {classification.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Date Range Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Today', value: 'today' },
                  { label: 'This Week', value: 'week' },
                  { label: 'This Month', value: 'month' },
                  { label: 'This Year', value: 'year' }
                ].map(range => (
                  <Button
                    key={range.value}
                    variant={filters.dateRange === range.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('dateRange', range.value)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.type?.map(type => (
            <Badge key={type} variant="secondary" className="flex items-center gap-1">
              {getTypeIcon(type)}
              <span className="capitalize">{type}</span>
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => handleFilterChange('type', type)}
              />
            </Badge>
          ))}
          {filters.space?.map(spaceId => {
            const space = spaces.find(s => s.id === spaceId)
            return space ? (
              <Badge key={spaceId} variant="secondary" className="flex items-center gap-1">
                <Folder className="w-3 h-3" style={{ color: space.color }} />
                {space.name}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleFilterChange('space', spaceId)}
                />
              </Badge>
            ) : null
          })}
          {filters.classification?.map(classId => {
            const classification = classifications.find(c => c.id === classId)
            return classification ? (
              <Badge key={classId} variant="secondary" className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {classification.name}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleFilterChange('classification', classId)}
                />
              </Badge>
            ) : null
          })}
          {filters.dateRange && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {filters.dateRange}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => handleFilterChange('dateRange', null)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

