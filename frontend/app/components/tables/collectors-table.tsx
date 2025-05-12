"use client";

import React from "react";
import { Collector as BaseCollector } from "../../lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export interface EnhancedCollector extends BaseCollector {
  dropId?: string;
  username?: string;
  txnHash?: string;
}

export interface CollectorsTableProps {
  collectors: BaseCollector[];
  showDropId?: boolean;
}

export function CollectorsTable({
  collectors,
  showDropId = false,
}: CollectorsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {showDropId && <TableHead>Drop ID</TableHead>}
          <TableHead>Username</TableHead>
          <TableHead>Wallet</TableHead>
          <TableHead>Transaction Hash</TableHead>
          <TableHead>Minted</TableHead>
          <TableHead>Power</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {collectors.map((collector, index) => {
          const enhancedCollector = collector as EnhancedCollector;
          return (
            <TableRow key={index}>
              {showDropId && (
                <TableCell>{enhancedCollector.dropId || "N/A"}</TableCell>
              )}
              <TableCell>{enhancedCollector.username || "N/A"}</TableCell>
              <TableCell>{collector.wallet}</TableCell>
              <TableCell>{enhancedCollector.txnHash || "N/A"}</TableCell>
              <TableCell>{collector.mintedTime}</TableCell>
              <TableCell>
                <div className="flex w-fit items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-sm font-medium text-orange-500">
                  <span>{collector.power}</span>
                  <span>Power</span>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
