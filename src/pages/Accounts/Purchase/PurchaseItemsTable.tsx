import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import type { PurchaseItem } from "./purchase.schema";

interface PurchaseSummary {
  totalQty: number;
  totalBags: number;
  totalAmount: number;
}

interface PurchaseItemsTableProps {
  items: PurchaseItem[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  summary: PurchaseSummary;
}

const PurchaseItemsTable = ({
  items,
  onEdit,
  onDelete,
  summary,
}: PurchaseItemsTableProps) => {
  if (items.length === 0) {
    return (
      <div className="bg-base-200 p-6 rounded-lg shadow-md text-center text-gray-500">
        No purchase items added yet. Add items to start building your purchase
        order.
      </div>
    );
  }

  return (
    <div className="bg-base-200 p-4 rounded-lg shadow-md">
      <h3 className="font-bold text-lg mb-3">Purchase Items</h3>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-300 text-base-content">
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Brand</th>
              <th className="p-3 text-left">Route</th>
              <th className="p-3 text-right">Qty (Ton)</th>
              <th className="p-3 text-right">Bags</th>
              <th className="p-3 text-right">Rate/Ton</th>
              <th className="p-3 text-right">Rate/Bag</th>
              <th className="p-3 text-right">Unit Price</th>
              <th className="p-3 text-right">Total Price</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={item.id}
                className="border-b border-base-300 hover:bg-base-300/50"
              >
                <td className="p-3 text-left">{index + 1}</td>
                <td className="p-3 text-left">{item.brandName}</td>
                <td className="p-3 text-left">{item.routeName}</td>
                <td className="p-3 text-right">{item.qtyInTon.toFixed(2)}</td>
                <td className="p-3 text-right">{item.bags}</td>
                <td className="p-3 text-right">{item.ratePerTon.toFixed(2)}</td>
                <td className="p-3 text-right">
                  {(item.ratePerBag ?? 0).toFixed(2)}
                </td>
                <td className="p-3 text-right">
                  {(item.unitPrice ?? 0).toFixed(2)}
                </td>
                <td className="p-3 text-right">
                  {(item.totalPrice ?? 0).toFixed(2)}
                </td>
                <td className="p-3 flex justify-center space-x-2">
                  <button
                    onClick={() => {
                      onEdit(index);
                    }}
                    className="btn btn-xs btn-circle btn-ghost text-info"
                    title="Edit item"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      onDelete(index);
                    }}
                    className="btn btn-xs btn-circle btn-ghost text-error"
                    title="Delete item"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold bg-base-300">
              <td colSpan={3} className="p-3 text-right">
                Totals:
              </td>
              <td className="p-3 text-right">{summary.totalQty.toFixed(2)}</td>
              <td className="p-3 text-right">{summary.totalBags}</td>
              <td colSpan={3}></td>
              <td className="p-3 text-right">
                {summary.totalAmount.toFixed(2)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default PurchaseItemsTable;
