import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

interface ImportResult {
  total: number;
  imported: number;
  errors: { row: number; message: string }[];
}

const REQUIRED_FIELDS = ['numero', 'estado', 'competencia', 'cliente_escritorio', 'fase_atual'];

const COLUMN_MAP: Record<string, string> = {
  numero: 'numero',
  tipo_acao: 'tipo_acao',
  estado: 'estado',
  competencia: 'competencia',
  categoria: 'categoria',
  autor: 'autor',
  reu: 'reu',
  cliente_escritorio: 'cliente_escritorio',
  grupo_id: 'grupo_id',
  primeira_instancia_tribunal: 'tribunal_primeira_instancia',
  primeira_instancia_numero: 'primeira_instancia_numero',
  primeira_instancia_comarca: 'primeira_instancia_comarca',
  vara_camara_turma: 'vara_camara_turma',
  sistema_acesso: 'sistema_acesso',
  telefone_secretaria: 'telefone_secretaria',
  telefone_assessoria: 'telefone_assessoria',
  segunda_instancia_numero: 'segunda_instancia_numero',
  segunda_instancia_tribunal: 'segunda_instancia_tribunal',
  segunda_instancia_turma: 'segunda_instancia_turma_camara',
  tribunal_superior: 'tribunal_superior_nome',
  tribunal_superior_numero: 'tribunal_superior_numero',
  tribunal_superior_turma: 'tribunal_superior_turma',
  fase_atual: 'fase_atual',
  senha_acesso: 'senha_acesso',
  informacoes_importantes: 'status',
};

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',' || ch === ';') {
          result.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map(parseRow);
  return { headers, rows };
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\s\-]/g, '_');
}

export function CsvImportDialog({ open, onOpenChange, onImportComplete }: CsvImportDialogProps) {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const text = await file.text();
      const { headers, rows } = parseCsv(text);

      if (headers.length === 0 || rows.length === 0) {
        toast({ title: 'Arquivo vazio', description: 'O CSV não contém dados.', variant: 'destructive' });
        setImporting(false);
        return;
      }

      // Map CSV headers to DB columns
      const normalizedHeaders = headers.map(normalizeHeader);
      const headerToDb: (string | null)[] = normalizedHeaders.map(h => COLUMN_MAP[h] || null);

      const errors: ImportResult['errors'] = [];
      const validInserts: Record<string, any>[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.every(cell => cell === '')) continue; // skip empty rows

        const record: Record<string, any> = {};
        headerToDb.forEach((dbCol, colIdx) => {
          if (dbCol && row[colIdx]) {
            record[dbCol] = row[colIdx];
          }
        });

        // Validate required fields
        const missing = REQUIRED_FIELDS.filter(f => !record[f]);
        if (missing.length > 0) {
          errors.push({ row: i + 2, message: `Campos obrigatórios ausentes: ${missing.join(', ')}` });
          continue;
        }

        // Set defaults for optional fields
        record.tipo_acao = record.tipo_acao || '';
        record.categoria = record.categoria || 'Mero Acompanhamento';
        record.autor = record.autor || '';
        record.origem = 'importacao';

        validInserts.push(record);
      }

      if (validInserts.length > 0) {
        const { error } = await supabase.from('processos').insert(validInserts as any);
        if (error) {
          errors.push({ row: 0, message: `Erro ao inserir: ${error.message}` });
        }
      }

      const importResult: ImportResult = {
        total: rows.filter(r => !r.every(c => c === '')).length,
        imported: validInserts.length - (errors.some(e => e.row === 0) ? validInserts.length : 0),
        errors,
      };

      setResult(importResult);

      if (importResult.imported > 0) {
        onImportComplete();
      }
    } catch {
      toast({ title: 'Erro ao processar arquivo', description: 'Verifique o formato do CSV.', variant: 'destructive' });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleClose = () => {
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-semibold tracking-[0.02em]">Importar Planilha</DialogTitle>
          <DialogDescription>
            Selecione um arquivo CSV com as colunas mapeadas para os campos do processo.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium">{result.imported} processo(s) importado(s)</p>
                <p className="text-xs text-muted-foreground">{result.total} linha(s) processada(s)</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-sm font-medium text-destructive">{result.errors.length} erro(s)</p>
                </div>
                <div className="max-h-40 overflow-auto rounded-md border border-border/60 p-3 space-y-1.5">
                  {result.errors.map((err, i) => (
                    <div key={i} className="text-xs text-muted-foreground">
                      {err.row > 0 && <Badge variant="outline" className="text-[10px] mr-1.5">Linha {err.row}</Badge>}
                      {err.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleClose} className="w-full">Fechar</Button>
          </div>
        ) : (
          <div className="py-4">
            <label className="block">
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                onChange={handleFile}
                className="hidden"
                disabled={importing}
              />
              <Button asChild variant="default" className="w-full cursor-pointer" disabled={importing}>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {importing ? 'Importando...' : 'Selecionar arquivo CSV'}
                </span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-3">
              Campos obrigatórios: <strong>numero</strong>, <strong>estado</strong>, <strong>competencia</strong>, <strong>cliente_escritorio</strong>, <strong>fase_atual</strong>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
