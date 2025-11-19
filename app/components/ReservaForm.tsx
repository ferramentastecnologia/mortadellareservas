'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Users, Clock, User, Mail, Phone, CreditCard } from 'lucide-react';
import CalendarioReserva from './CalendarioReserva';

type ReservaFormData = {
  nome: string;
  email: string;
  telefone: string;
  tipoDocumento: 'cpf' | 'cnpj';
  documento: string;
  data: string;
  horario: string;
  numeroPessoas: number;
};

const horarios = [
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];

// Funções de validação e formatação
const validarCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/\D/g, '');

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;

  return true;
};

const validarCNPJ = (cnpj: string): boolean => {
  cnpj = cnpj.replace(/\D/g, '');

  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
};

const formatarCPF = (cpf: string): string => {
  cpf = cpf.replace(/\D/g, '');
  cpf = cpf.substring(0, 11);
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return cpf;
};

const formatarCNPJ = (cnpj: string): string => {
  cnpj = cnpj.replace(/\D/g, '');
  cnpj = cnpj.substring(0, 14);
  cnpj = cnpj.replace(/(\d{2})(\d)/, '$1.$2');
  cnpj = cnpj.replace(/(\d{3})(\d)/, '$1.$2');
  cnpj = cnpj.replace(/(\d{3})(\d)/, '$1/$2');
  cnpj = cnpj.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  return cnpj;
};

export default function ReservaForm() {
  const [loading, setLoading] = useState(false);
  const [etapa, setEtapa] = useState<'formulario' | 'pagamento'>('formulario');
  const [dadosReserva, setDadosReserva] = useState<ReservaFormData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [tipoDocumento, setTipoDocumento] = useState<'cpf' | 'cnpj'>('cpf');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ReservaFormData>({
    defaultValues: {
      tipoDocumento: 'cpf',
    },
  });

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setValue('data', date);
  };

  const onSubmit = async (data: ReservaFormData) => {
    setLoading(true);
    setDadosReserva(data);

    try {
      // Chamar API de criação de pagamento (DEMO)
      const response = await fetch('/api/create-payment-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success && result.invoiceUrl) {
        // Redirecionar para página de pagamento do Asaas
        window.location.href = result.invoiceUrl;
      } else {
        alert('Erro ao processar reserva. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao processar reserva. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Coluna 1: Dados Pessoais */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-xl font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-[#0e9a20]" />
                Seus Dados
              </h4>

              <div>
                <label className="block text-sm font-medium mb-2">Nome Completo *</label>
                <input
                  {...register('nome', { required: 'Nome é obrigatório' })}
                  type="text"
                  className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#0e9a20] text-white"
                  placeholder="Seu nome completo"
                />
                {errors.nome && (
                  <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">E-mail *</label>
                <input
                  {...register('email', {
                    required: 'E-mail é obrigatório',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'E-mail inválido',
                    },
                  })}
                  type="email"
                  className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#0e9a20] text-white"
                  placeholder="seu@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Telefone/WhatsApp *</label>
                <input
                  {...register('telefone', {
                    required: 'Telefone é obrigatório',
                    pattern: {
                      value: /^[\d\s()+-]+$/,
                      message: 'Telefone inválido',
                    },
                  })}
                  type="tel"
                  className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#0e9a20] text-white"
                  placeholder="(00) 00000-0000"
                />
                {errors.telefone && (
                  <p className="text-red-500 text-sm mt-1">{errors.telefone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Documento *</label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      {...register('tipoDocumento')}
                      type="radio"
                      value="cpf"
                      onChange={(e) => {
                        setTipoDocumento('cpf');
                        setValue('documento', '');
                      }}
                      className="mr-2 w-4 h-4 text-[#0e9a20] bg-black border-zinc-700 focus:ring-[#0e9a20]"
                    />
                    <span>CPF</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      {...register('tipoDocumento')}
                      type="radio"
                      value="cnpj"
                      onChange={(e) => {
                        setTipoDocumento('cnpj');
                        setValue('documento', '');
                      }}
                      className="mr-2 w-4 h-4 text-[#0e9a20] bg-black border-zinc-700 focus:ring-[#0e9a20]"
                    />
                    <span>CNPJ</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {tipoDocumento === 'cpf' ? 'CPF' : 'CNPJ'} *
                </label>
                <input
                  {...register('documento', {
                    required: `${tipoDocumento === 'cpf' ? 'CPF' : 'CNPJ'} é obrigatório`,
                    validate: (value) => {
                      const documento = value.replace(/\D/g, '');
                      if (tipoDocumento === 'cpf') {
                        return validarCPF(documento) || 'CPF inválido';
                      } else {
                        return validarCNPJ(documento) || 'CNPJ inválido';
                      }
                    },
                  })}
                  type="text"
                  className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#0e9a20] text-white"
                  placeholder={tipoDocumento === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                  onChange={(e) => {
                    const formatted = tipoDocumento === 'cpf'
                      ? formatarCPF(e.target.value)
                      : formatarCNPJ(e.target.value);
                    setValue('documento', formatted);
                  }}
                />
                {errors.documento && (
                  <p className="text-red-500 text-sm mt-1">{errors.documento.message}</p>
                )}
              </div>
            </div>

            {/* Resumo e Pagamento (embaixo do formulário de dados pessoais) */}
            <div className="border-t border-zinc-800 pt-6">
              <h4 className="text-xl font-semibold mb-4">Resumo da Reserva</h4>

              <div className="bg-black rounded-lg p-6 border border-zinc-700">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-700 mb-4">
                  <span className="text-lg text-zinc-400">Valor da Reserva:</span>
                  <span className="text-3xl font-bold text-[#0e9a20]">R$ 50,00</span>
                </div>

                <div className="bg-zinc-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-zinc-300 mb-2">
                    <strong className="text-[#0e9a20]">100% conversível</strong> em consumação
                  </p>
                  <p className="text-xs text-zinc-400">
                    Este valor retorna integralmente no dia da sua reserva
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0e9a20] hover:bg-[#0a6b16] text-white font-bold text-lg py-5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    'Processando...'
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6" />
                      Continuar para Pagamento
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-zinc-500 mt-3">
                  Pagamento seguro via Asaas
                </p>
              </div>
            </div>
          </div>

          {/* Coluna 2: Detalhes da Reserva */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#0e9a20]" />
              Detalhes da Reserva
            </h4>

            <div>
              <label className="block text-sm font-medium mb-4">Data *</label>
              <input
                type="hidden"
                {...register('data', { required: 'Selecione uma data' })}
              />
              <CalendarioReserva
                onSelectDate={handleDateSelect}
                selectedDate={selectedDate}
              />
              {errors.data && (
                <p className="text-red-500 text-sm mt-2">{errors.data.message}</p>
              )}
              {selectedDate && (
                <p className="text-[#0e9a20] text-sm mt-2">
                  Data selecionada: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Horário *</label>
              <select
                {...register('horario', { required: 'Horário é obrigatório' })}
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#0e9a20] text-white"
              >
                <option value="">Selecione um horário</option>
                {horarios.map((horario) => (
                  <option key={horario} value={horario}>
                    {horario}
                  </option>
                ))}
              </select>
              {errors.horario && (
                <p className="text-red-500 text-sm mt-1">{errors.horario.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Número de Pessoas *</label>
              <input
                {...register('numeroPessoas', {
                  required: 'Número de pessoas é obrigatório',
                  valueAsNumber: true,
                  min: {
                    value: 1,
                    message: 'Mínimo 1 pessoa'
                  },
                  max: {
                    value: 100,
                    message: 'Para grupos acima de 100 pessoas, entre em contato diretamente'
                  }
                })}
                type="number"
                min="1"
                max="100"
                placeholder="Digite o número de pessoas"
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#0e9a20] text-white"
              />
              {errors.numeroPessoas && (
                <p className="text-red-500 text-sm mt-1">{errors.numeroPessoas.message}</p>
              )}
              <p className="text-xs text-zinc-500 mt-1">
                Para grupos grandes, reserve com antecedência
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
