import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";

interface Column {
  name: string;
  uid: string;
  render?: (item: any) => React.ReactNode;
}

interface ReusableTableProps {
  columns: Column[];
  tableData: any[];
}

const ReusableTable: React.FC<ReusableTableProps> = ({
  columns,
  tableData,
}) => {
  return (
    <Table aria-label="Example static collection table">
      <TableHeader>
        {columns.map((column) => (
          <TableColumn
            key={column.uid}
            hideHeader={column.uid === "actions"}
            align={column.uid === "actions" ? "center" : "start"}
          >
            {column.name}
          </TableColumn>
        ))}
      </TableHeader>
      <TableBody>
        {tableData.map((item, rowIndex) => (
          <TableRow key={item.id || rowIndex}>
            {columns.map((column) => (
              <TableCell key={column.uid}>
                {column.render ? column.render(item) : item[column.uid]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ReusableTable;
