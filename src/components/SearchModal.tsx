import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { 
  Search, 
  History, 
  User as UserIcon, 
  FileText, 
  Command as CommandIcon,
  X,
  ArrowRight,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import api, { SearchResult } from '@/api/endpoints';

const SearchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  const performSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults(null);
      return;
    }
    setIsLoading(true);
    try {
      const data = await api.search(searchTerm);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) performSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleSelect = (url: string, title: string) => {
    saveRecentSearch(title);
    navigate(url);
    onClose();
    setQuery('');
  };

  const DynamicIcon = ({ name, fallback: Fallback }: { name: string; fallback: any }) => {
    const Icon = (LucideIcons as any)[name] || Fallback;
    return <Icon className="h-4 w-4" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-primary/20">
        <Command label="Global Search" className="flex flex-col h-full">
          <div className="flex items-center px-4 border-b border-border">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Command.Input
              autoFocus
              placeholder="Search pages, history, users..."
              value={query}
              onValueChange={setQuery}
              className="flex-1 h-16 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground px-4 text-lg font-medium"
            />
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                <CommandIcon className="h-3 w-3" />
                <span>K</span>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <Command.List className="max-h-[60vh] overflow-y-auto p-2 space-y-4">
            <Command.Empty className="py-12 text-center text-muted-foreground">
              {isLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                  <p className="text-sm font-medium">Searching across Insight Hub...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-foreground">No results found for "{query}"</p>
                  <p className="text-sm">Try searching for "Dashboard", "Profile", or "Settings"</p>
                </div>
              )}
            </Command.Empty>

            {!query && recentSearches.length > 0 && (
              <Command.Group heading={<span className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Clock className="h-3 w-3" /> Recent Searches</span>}>
                {recentSearches.map((term) => (
                  <Command.Item
                    key={term}
                    onSelect={() => setQuery(term)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary/10 cursor-pointer transition-all active:scale-[0.98] group"
                  >
                    <History className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    <span className="flex-1 font-medium text-muted-foreground group-hover:text-foreground">{term}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-all" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {results?.pages && results.pages.length > 0 && (
              <Command.Group heading={<span className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><FileText className="h-3 w-3" /> Pages & Features</span>}>
                {results.pages.map((page) => (
                  <Command.Item
                    key={page.url}
                    onSelect={() => handleSelect(page.url, page.title)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary/10 cursor-pointer transition-all active:scale-[0.98] group"
                  >
                    <div className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/20 transition-colors">
                      <DynamicIcon name={page.icon} fallback={LayoutDashboard} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground group-hover:text-primary transition-colors">{page.title}</p>
                      <p className="text-xs text-muted-foreground">{page.url}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {results?.history && results.history.length > 0 && (
              <Command.Group heading={<span className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><History className="h-3 w-3" /> Your Activity</span>}>
                {results.history.map((h, i) => (
                  <Command.Item
                    key={i}
                    onSelect={() => handleSelect('/dashboard', h.title)} // Generic redirect for history
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary/10 cursor-pointer transition-all active:scale-[0.98] group"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    <span className="flex-1 font-medium">{h.title}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(h.visited_at).toLocaleDateString()}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {results?.users && results.users.length > 0 && (
              <Command.Group heading={<span className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><UserIcon className="h-3 w-3" /> Users (Admin)</span>}>
                {results.users.map((u) => (
                  <Command.Item
                    key={u.id}
                    onSelect={() => handleSelect(`/admin/dashboard`, u.name)} // Search takes to admin dashboard for user management
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary/10 cursor-pointer transition-all active:scale-[0.98] group"
                  >
                    <div className="h-10 w-10 rounded-full border border-border overflow-hidden bg-muted">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">
                          {u.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground group-hover:text-primary transition-colors">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded border border-border bg-background">↑↓</kbd> Navigate</span>
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded border border-border bg-background">Enter</kbd> Select</span>
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded border border-border bg-background">Esc</kbd> Close</span>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <Search className="h-3 w-3" />
              <span>Insight Hub Search</span>
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
};

export default SearchModal;
