"use client";

import { useState, useMemo } from "react";
import { useCreditsStore } from "../../lib/hooks/use-credits-store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Input } from "../ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { copyToClipboard } from "../../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown";

export default function TransactionsHistory() {
  const { transactions } = useCreditsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [amountFilter, setAmountFilter] = useState<string>("");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const itemsPerPage = 5;

  const filteredTransactions = useMemo(() => {
    if (!transactions.length) return [];

    return transactions.filter((tx) => {
      const searchLower = searchQuery.toLowerCase();
      const includesSearch =
        tx.txHash.toLowerCase().includes(searchLower) ||
        new Date(tx.timestamp)
          .toLocaleString()
          .toLowerCase()
          .includes(searchLower) ||
        tx.amount.toString().includes(searchLower) ||
        tx.credits.toString().includes(searchLower);

      const passesAmountFilter =
        !amountFilter ||
        (amountFilter === "high" && tx.amount >= 1) ||
        (amountFilter === "medium" && tx.amount >= 0.5 && tx.amount < 1) ||
        (amountFilter === "low" && tx.amount < 0.5);

      return includesSearch && passesAmountFilter;
    });
  }, [transactions, searchQuery, amountFilter]);

  const pageCount = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const handleCopyHash = async (hash: string) => {
    const success = await copyToClipboard(hash);
    if (success) {
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 2000);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center">
        <h2 className="mb-2 text-lg font-medium">Transaction History</h2>
        <p className="text-muted-foreground">No Transactions Yet</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="mb-4 font-garamond text-xl italic tracking-wide">
        Transaction History
      </h2>

      {/* Search and filter controls */}
      <div className="mb-4 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-x-2 sm:space-y-0">
        <div className="relative w-full sm:w-64">
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50">
            <Filter className="mr-2 h-4 w-4" />
            <span>Filter</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by Amount</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => setAmountFilter("")}
                className={amountFilter === "" ? "bg-accent" : ""}
              >
                All Amounts
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setAmountFilter("high")}
                className={amountFilter === "high" ? "bg-accent" : ""}
              >
                High (&ge; 1 SOL)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setAmountFilter("medium")}
                className={amountFilter === "medium" ? "bg-accent" : ""}
              >
                Medium (0.5 - 1 SOL)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setAmountFilter("low")}
                className={amountFilter === "low" ? "bg-accent" : ""}
              >
                Low (&lt; 0.5 SOL)
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="flex w-full rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Transaction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((tx, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {new Date(tx.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{tx.amount} Credits</TableCell>
                  <TableCell>{tx.amount / 100} SOL</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <a
                        href={`https://explorer.solana.com/tx/${tx.txHash}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary inline-flex items-center gap-1 text-orange-500 hover:underline"
                      >
                        <span>{tx.txHash.slice(0, 10)}...</span>
                        <button
                          onClick={() => handleCopyHash(tx.txHash)}
                          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground ml-1 rounded-full p-1"
                          title="Copy transaction hash"
                        >
                          {copiedHash === tx.txHash ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-orange-500" />
                          )}
                        </button>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground py-4 text-center"
                >
                  No Transactions Found Matching Your Filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredTransactions.length)}{" "}
            of {filteredTransactions.length} transactions
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center rounded-md border p-1.5 text-sm disabled:opacity-50 disabled:hover:bg-transparent"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm">
              Page {currentPage} of {pageCount}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
              disabled={currentPage === pageCount}
              className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center rounded-md border p-1.5 text-sm disabled:opacity-50 disabled:hover:bg-transparent"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
