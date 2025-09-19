import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const denominations = [
  { value: 500, type: 'b_500', label: '500€' }, { value: 200, type: 'b_200', label: '200€' },
  { value: 100, type: 'b_100', label: '100€' }, { value: 50, type: 'b_50', label: '50€' },
  { value: 20, type: 'b_20', label: '20€' }, { value: 10, type: 'b_10', label: '10€' },
  { value: 5, type: 'b_5', label: '5€' }, { value: 2, type: 'm_2', label: '2€' },
  { value: 1, type: 'm_1', label: '1€' }, { value: 0.50, type: 'm_050', label: '0.50€' },
  { value: 0.20, type: 'm_020', label: '0.20€' }, { value: 0.10, type: 'm_010', label: '0.10€' },
  { value: 0.05, type: 'm_005', label: '0.05€' }, { value: 0.02, type: 'm_002', label: '0.02€' },
  { value: 0.01, type: 'm_001', label: '0.01€' },
];

const ArqueoModal = ({ open, setOpen, onSave, saving, initialData, title, description, isEditable }) => {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const initialCounts = {};
    if (initialData) {
      denominations.forEach(d => {
        initialCounts[d.type] = initialData[d.type] || 0;
      });
    } else {
      denominations.forEach(d => {
        initialCounts[d.type] = 0;
      });
    }
    setCounts(initialCounts);
  }, [initialData, open]);

  const handleCountChange = (type, value) => {
    const intValue = parseInt(value, 10);
    setCounts(prev => ({ ...prev, [type]: isNaN(intValue) ? 0 : intValue }));
  };

  const total = useMemo(() => {
    return denominations.reduce((acc, d) => {
      return acc + (counts[d.type] || 0) * d.value;
    }, 0);
  }, [counts]);

  const handleSave = () => {
    onSave(counts);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-2">
          {denominations.map(d => (
            <div key={d.type} className="space-y-1">
              <Label htmlFor={d.type}>{d.label}</Label>
              <Input
                id={d.type}
                type="number"
                min="0"
                value={counts[d.type] || ''}
                onChange={e => handleCountChange(d.type, e.target.value)}
                placeholder="0"
                disabled={!isEditable}
              />
            </div>
          ))}
        </div>
        <div className="p-4 mt-4 bg-secondary rounded-lg text-center">
          <p className="text-muted-foreground">Total Calculado</p>
          <p className="text-3xl font-bold">€{total.toFixed(2)}</p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          {isEditable && (
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Arqueo
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ArqueoModal;