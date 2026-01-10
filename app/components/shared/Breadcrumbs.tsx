import Link from "next/link";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className="hidden md:flex mb-2">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
                {items.map((item, index) => (
                    <li key={index} className="inline-flex items-center">
                        {index > 0 && (
                            <span className="material-symbols-outlined text-gray-400 text-sm mx-1">
                                chevron_right
                            </span>
                        )}
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="text-sm font-medium text-gray-500 hover:text-[#13ec5b] dark:text-gray-400 dark:hover:text-white transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-sm font-medium text-[#0d1b12] dark:text-white truncate max-w-[200px]">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
