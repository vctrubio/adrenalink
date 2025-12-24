export function filterBySearch<T>(items: T[], search: string, getSearchableText: (item: T) => string): T[] {
    if (!search) return items;
    const searchLower = search.toLowerCase();
    return items.filter((item) => getSearchableText(item).toLowerCase().includes(searchLower));
}
