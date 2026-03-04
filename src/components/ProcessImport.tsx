import { useState, useCallback } from 'react';
import { Competencia, Categoria } from '@/types/process';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileSpreadsheet, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface ImportRow {
  cliente: string;
  parteContraria: string;
  numero: string;
  orgaoJulgador: string;
  classe: string;
  valid: boolean;
  error?: string;
}

interface ProcessImportProps {
  onImport: (rows: Array<{
    numero: string;
    tipoAcao: string;
    estado: string;
    competencia: Competencia;
    categoria: Categoria;
    autor: string;
    reu: string;
    clienteEscritorio: 'Autor' | 'Réu';
    varaCamaraTurma: string;
    sistemaAcesso: string;
    telefoneSecretaria: string;
    telefoneAssessoria: string;
    senhaAcesso: string;
    status: string;
    ultimaMovimentacao: string;
    [key: string]: any;
  }>) => Promise<{ imported: number; skipped: number } | void>;
}

function normalizeHeader(h: string): string {
  const s = h.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\s_\-]/g, '');
  if (s.includes('cliente') && !s.includes('escritorio')) return 'cliente';
  if (s.includes('contraria') || (s.includes('parte') && !s.includes('cliente'))) return 'parteContraria';
  if (s.includes('numero') || s.includes('processo')) return 'numero';
  if (s.includes('orgao') || s.includes('julgador') || s.includes('vara')) return 'orgaoJulgador';
  if (s.includes('classe') || s.includes('tipo') || s.includes('acao')) return 'classe';
  return '';
}

export function ProcessImport({ onImport }: ProcessImportProps) {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const navigate = useNavigate();

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (json.length === 0) {
          toast({ title: 'Planilha vazia', description: 'Nenhum dado encontrado na planilha.', variant: 'destructive' });
          return;
        }

        const headers = Object.keys(json[0]);
        const mapping: Record<string, string> = {};
        headers.forEach(h => {
          const norm = normalizeHeader(h);
          if (norm) mapping[norm] = h;
        });

        const parsed: ImportRow[] = json.map(row => {
          const cliente = String(row[mapping.cliente] || '').trim();
          const parteContraria = String(row[mapping.parteContraria] || '').trim();
          const numero = String(row[mapping.numero] || '').trim();
          const orgaoJulgador = String(row[mapping.orgaoJulgador] || '').trim();
          const classe = String(row[mapping.classe] || '').trim();

          const valid = numero.length > 0;
          return {
            cliente,
            parteContraria,
            numero,
            orgaoJulgador,
            classe,
            valid,
            error: !valid ? 'Número do processo obrigatório' : undefined,
          };
        });

        setRows(parsed);
      } catch {
        toast({ title: 'Erro ao ler arquivo', description: 'Verifique se o formato é CSV ou Excel válido.', variant: 'destructive' });
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const validRows = rows.filter(r => r.valid);
  const invalidRows = rows.filter(r => !r.valid);

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);
    try {
      const mapped = validRows.map(r => ({
        numero: r.numero,
        tipoAcao: r.classe || '',
        estado: '',
        competencia: 'Estadual' as const,
        categoria: 'Mero Acompanhamento' as const,
        autor: r.cliente,
        reu: r.parteContraria,
        clienteEscritorio: 'Autor' as const,
        varaCamaraTurma: r.orgaoJulgador,
        tribunalPrimeiraInstancia: (r as any).tribunalPrimeiraInstancia || '',
        sistemaAcesso: '',
        telefoneSecretaria: '',
        telefoneAssessoria: '',
        senhaAcesso: '',
        status: '',
        ultimaMovimentacao: '',
      }));
      const result = await onImport(mapped);
      const desc = result && typeof result === 'object'
        ? `${result.imported} importado(s)${result.skipped > 0 ? `, ${result.skipped} duplicado(s) ignorado(s)` : ''}.`
        : `${validRows.length} processo(s) importado(s) com sucesso.`;
      toast({ title: 'Importação concluída', description: desc });
      navigate('/processos');
    } catch {
      toast({ title: 'Erro na importação', description: 'Ocorreu um erro ao salvar os processos.', variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link to="/processos">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">IMPORTAR PROCESSOS</h2>
          <p className="text-sm text-muted-foreground mt-1">Importe processos em lote a partir de uma planilha Excel ou CSV</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <Card className="border-dashed border-2 border-border/80">
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground/60" />
              <div>
                <p className="text-base font-medium text-foreground">Selecione um arquivo Excel ou CSV</p>
                <p className="text-sm text-muted-foreground mt-1">
                  A planilha deve conter colunas: <strong>Cliente</strong>, <strong>Parte Contrária</strong>, <strong>Número do Processo</strong>, <strong>Órgão Julgador</strong>, <strong>Classe</strong>
                </p>
              </div>
              <label className="inline-block">
                <Input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFile}
                  className="hidden"
                />
                <Button asChild variant="default" className="cursor-pointer">
                  <span><Upload className="h-4 w-4 mr-2" />SELECIONAR ARQUIVO</span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="text-lg">{fileName}</CardTitle>
                  <CardDescription className="mt-1">
                    {validRows.length} processo(s) válido(s)
                    {invalidRows.length > 0 && <span className="text-destructive ml-2">• {invalidRows.length} com erro</span>}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <label>
                    <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
                    <Button asChild variant="outline" size="sm" className="cursor-pointer">
                      <span>TROCAR ARQUIVO</span>
                    </Button>
                  </label>
                  <Button onClick={handleImport} disabled={importing || validRows.length === 0} size="sm">
                    {importing ? 'Importando...' : `IMPORTAR ${validRows.length} PROCESSO(S)`}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-auto max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>NÚMERO</TableHead>
                      <TableHead>CLIENTE</TableHead>
                      <TableHead>PARTE CONTRÁRIA</TableHead>
                      <TableHead>ÓRGÃO JULGADOR</TableHead>
                      <TableHead>CLASSE</TableHead>
                      <TableHead className="w-24">STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, i) => (
                      <TableRow key={i} className={!row.valid ? 'bg-destructive/5' : ''}>
                        <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                        <TableCell className="font-mono text-sm">{row.numero || '—'}</TableCell>
                        <TableCell>{row.cliente || '—'}</TableCell>
                        <TableCell>{row.parteContraria || '—'}</TableCell>
                        <TableCell>{row.orgaoJulgador || '—'}</TableCell>
                        <TableCell>{row.classe || '—'}</TableCell>
                        <TableCell>
                          {row.valid ? (
                            <Badge variant="secondary" className="gap-1 text-xs"><Check className="h-3 w-3" />OK</Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1 text-xs"><AlertCircle className="h-3 w-3" />{row.error}</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}</TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
