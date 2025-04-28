import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations();
  if (tableData.length == 0) {
    return <div className="text-center">{t("global.alert.noData")}</div>;
  }
  return (
    <Table 
      aria-label="Example static collection table"
      className="rtl:text-right ltr:text-left"
    >
      <TableHeader>
        {columns.map((column) => (
          <TableColumn
            key={column.uid}
            hideHeader={column.uid === "actions"}
            align={column.uid === "actions" ? "center" : "start"}
            className="rtl:text-right ltr:text-left"
          >
            {column.name}
          </TableColumn>
        ))}
      </TableHeader>
      <TableBody>
        {tableData.map((item, rowIndex) => (
          <TableRow key={item.id || rowIndex}>
            {columns.map((column) => (
              <TableCell 
                key={column.uid}
                className="rtl:text-right ltr:text-left"
              >
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
