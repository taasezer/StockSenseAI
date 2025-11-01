import { ReactNode } from 'react'

export const Table = ({ children }: { children: ReactNode }) => (
  <table className="min-w-full divide-y divide-gray-200">{children}</table>
)

export const TableHeader = ({ children }: { children: ReactNode }) => (
  <thead className="bg-gray-50">{children}</thead>
)

export const TableBody = ({ children }: { children: ReactNode }) => (
  <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
)

export const TableRow = ({ children }: { children: ReactNode }) => (
  <tr>{children}</tr>
)

export const TableHead = ({ children }: { children: ReactNode }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    {children}
  </th>
)

export const TableCell = ({ children }: { children: ReactNode }) => (
  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{children}</td>
)
