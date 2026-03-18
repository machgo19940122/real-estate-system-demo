"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { type NegotiationHistory } from "@/src/data/mock";

type Draft = Pick<NegotiationHistory, "date" | "memo" | "entered_by">;

function nextId(items: NegotiationHistory[]): number {
  return items.length ? Math.max(...items.map((x) => x.id)) + 1 : 1;
}

export function NegotiationHistoryClient({
  initialHistories,
}: {
  initialHistories: NegotiationHistory[];
}) {
  const [items, setItems] = useState<NegotiationHistory[]>(initialHistories);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const sorted = useMemo(() => {
    return items
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));
  }, [items]);

  const [addDraft, setAddDraft] = useState<Draft>({
    date: new Date().toISOString().slice(0, 10),
    memo: "",
    entered_by: "",
  });

  const [editDraft, setEditDraft] = useState<Draft>({
    date: "",
    memo: "",
    entered_by: "",
  });

  const startAdd = () => {
    setAddDraft({
      date: new Date().toISOString().slice(0, 10),
      memo: "",
      entered_by: "",
    });
    setIsAdding(true);
    setEditingId(null);
  };

  const cancelAdd = () => setIsAdding(false);

  const commitAdd = () => {
    const memo = addDraft.memo.trim();
    const enteredBy = addDraft.entered_by.trim();
    if (!addDraft.date || memo.length === 0 || enteredBy.length === 0) return;

    setItems((prev) => [
      {
        id: nextId(prev),
        customer_id: prev[0]?.customer_id ?? 0,
        date: addDraft.date,
        memo,
        entered_by: enteredBy,
      },
      ...prev,
    ]);
    setIsAdding(false);
  };

  const startEdit = (row: NegotiationHistory) => {
    setEditingId(row.id);
    setIsAdding(false);
    setEditDraft({ date: row.date, memo: row.memo, entered_by: row.entered_by });
  };

  const cancelEdit = () => setEditingId(null);

  const commitEdit = () => {
    if (editingId == null) return;
    const memo = editDraft.memo.trim();
    const enteredBy = editDraft.entered_by.trim();
    if (!editDraft.date || memo.length === 0 || enteredBy.length === 0) return;

    setItems((prev) =>
      prev.map((x) =>
        x.id === editingId
          ? { ...x, date: editDraft.date, memo, entered_by: enteredBy }
          : x
      )
    );
    setEditingId(null);
  };

  const remove = (id: number) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const addDisabled =
    !addDraft.date || addDraft.memo.trim().length === 0 || addDraft.entered_by.trim().length === 0;
  const editDisabled =
    !editDraft.date || editDraft.memo.trim().length === 0 || editDraft.entered_by.trim().length === 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b flex items-center justify-between">
        <CardTitle>交渉履歴</CardTitle>
        {!isAdding ? (
          <Button variant="outline" size="sm" type="button" onClick={startAdd}>
            追加
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" type="button" onClick={cancelAdd}>
              キャンセル
            </Button>
            <Button size="sm" type="button" onClick={commitAdd} disabled={addDisabled}>
              追加する
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {isAdding && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">日付</p>
                <input
                  type="date"
                  value={addDraft.date}
                  onChange={(e) => setAddDraft((p) => ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                />
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 mb-1">入力者</p>
                <input
                  value={addDraft.entered_by}
                  onChange={(e) => setAddDraft((p) => ({ ...p, entered_by: e.target.value }))}
                  placeholder="例: 佐藤花子"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">メモ</p>
              <textarea
                value={addDraft.memo}
                onChange={(e) => setAddDraft((p) => ({ ...p, memo: e.target.value }))}
                rows={3}
                placeholder="交渉の内容を入力"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              />
            </div>
          </div>
        )}

        {sorted.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/60">
                <TableHead className="text-xs md:text-sm font-semibold">日付</TableHead>
                <TableHead className="text-xs md:text-sm font-semibold">メモ</TableHead>
                <TableHead className="text-xs md:text-sm font-semibold">入力者</TableHead>
                <TableHead className="text-xs md:text-sm font-semibold text-right">
                  操作
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((row) => {
                const isEditing = editingId === row.id;
                return (
                  <TableRow key={row.id} className="hover:bg-gray-50/60">
                    <TableCell className="text-xs md:text-sm">
                      {isEditing ? (
                        <input
                          type="date"
                          value={editDraft.date}
                          onChange={(e) =>
                            setEditDraft((p) => ({ ...p, date: e.target.value }))
                          }
                          className="w-[160px] px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        />
                      ) : (
                        formatDate(row.date)
                      )}
                    </TableCell>
                    <TableCell className="text-xs md:text-sm text-gray-700 whitespace-normal">
                      {isEditing ? (
                        <textarea
                          value={editDraft.memo}
                          onChange={(e) =>
                            setEditDraft((p) => ({ ...p, memo: e.target.value }))
                          }
                          rows={2}
                          className="w-full min-w-[240px] px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        />
                      ) : (
                        row.memo
                      )}
                    </TableCell>
                    <TableCell className="text-xs md:text-sm">
                      {isEditing ? (
                        <input
                          value={editDraft.entered_by}
                          onChange={(e) =>
                            setEditDraft((p) => ({ ...p, entered_by: e.target.value }))
                          }
                          className="w-[160px] px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        />
                      ) : (
                        row.entered_by
                      )}
                    </TableCell>
                    <TableCell className="text-xs md:text-sm text-right">
                      {!isEditing ? (
                        <div className="inline-flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => startEdit(row)}
                          >
                            編集
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => remove(row.id)}
                          >
                            削除
                          </Button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2">
                          <Button variant="outline" size="sm" type="button" onClick={cancelEdit}>
                            キャンセル
                          </Button>
                          <Button size="sm" type="button" onClick={commitEdit} disabled={editDisabled}>
                            保存
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-gray-500 text-center py-4">交渉履歴はまだありません</p>
        )}
      </CardContent>
    </Card>
  );
}

