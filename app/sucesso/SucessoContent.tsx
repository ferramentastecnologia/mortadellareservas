'use client';

import { Check, Calendar, MapPin, Clock, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface VoucherData {
  codigo: string;
  reservation: {
    nome: string;
    data: string;
    horario: string;
    numeroPessoas: number;
  };
}

export default function SucessoContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const [voucher, setVoucher] = useState<VoucherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (paymentId) {
      const checkVoucher = async () => {
        try {
          const response = await fetch(`/api/get-voucher?paymentId=${paymentId}`);
          if (response.ok) {
            const data = await response.json();
            setVoucher(data.voucher);
          }
        } catch (error) {
          console.error('Erro ao buscar voucher:', error);
        } finally {
          setLoading(false);
        }
      };

      let attempts = 0;
      const maxAttempts = 10;

      const interval = setInterval(async () => {
        attempts++;
        await checkVoucher();

        if (voucher || attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 3000);

      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [paymentId]);

  return (
    <div className="flex items-center justify-center p-4 py-12">
      <div className="max-w-3xl w-full">
        <div className="bg-zinc-900 rounded-lg p-8 md:p-12 border border-zinc-800">
          <div className="w-24 h-24 bg-[#0e9a20] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-white" strokeWidth={3} />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Pagamento Confirmado!
          </h1>

          <p className="text-xl text-zinc-300 mb-8 text-center">
            Sua reserva foi confirmada com sucesso
          </p>

          {loading && !voucher && (
            <div className="bg-black rounded-lg p-8 mb-8 text-center border border-zinc-700">
              <p className="text-zinc-400">Gerando seu voucher...</p>
              <div className="mt-4 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0e9a20]"></div>
              </div>
            </div>
          )}

          {voucher && (
            <>
              <div className="bg-gradient-to-br from-[#0e9a20]/20 to-[#0a6b16]/20 border-2 border-[#0e9a20] rounded-lg p-8 mb-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Ticket className="w-6 h-6 text-[#0e9a20]" />
                  <p className="text-sm font-semibold text-[#0e9a20] uppercase tracking-wide">
                    Código do Voucher
                  </p>
                </div>

                <p className="text-4xl md:text-5xl font-bold text-white font-mono mb-4 tracking-wider">
                  {voucher.codigo}
                </p>

                <p className="text-sm text-zinc-300">
                  Apresente este código na chegada ao restaurante
                </p>
              </div>

              <div className="bg-black rounded-lg p-6 md:p-8 mb-8 border border-zinc-700">
                <h2 className="text-2xl font-semibold mb-6 text-center flex items-center justify-center gap-2">
                  <Calendar className="w-6 h-6 text-[#0e9a20]" />
                  Detalhes da Reserva
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center md:text-left">
                    <p className="text-sm text-zinc-400 mb-1">Nome</p>
                    <p className="text-lg font-semibold">{voucher.reservation.nome}</p>
                  </div>

                  <div className="text-center md:text-left">
                    <p className="text-sm text-zinc-400 mb-1">Data</p>
                    <p className="text-lg font-semibold">
                      {new Date(voucher.reservation.data + 'T00:00:00').toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="text-center md:text-left">
                    <p className="text-sm text-zinc-400 mb-1">Horário</p>
                    <p className="text-lg font-semibold">{voucher.reservation.horario}</p>
                  </div>

                  <div className="text-center md:text-left">
                    <p className="text-sm text-zinc-400 mb-1">Pessoas</p>
                    <p className="text-lg font-semibold">{voucher.reservation.numeroPessoas} pessoas</p>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="bg-[#0e9a20]/10 border border-[#0e9a20]/30 rounded-lg p-6 mb-8">
            <p className="text-sm text-zinc-400 mb-2 text-center">Valor Pago</p>
            <p className="text-4xl font-bold text-[#0e9a20] mb-3 text-center">R$ 50,00</p>
            <p className="text-base text-zinc-200 text-center font-medium">
              <span className="text-[#0e9a20]">✨ 100% conversível</span> em consumação
            </p>
            <p className="text-sm text-zinc-400 text-center mt-2">
              Este valor retorna integralmente no dia da sua reserva
            </p>
          </div>

          <div className="bg-black rounded-lg p-6 mb-8 border border-zinc-700">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0e9a20]" />
              Próximos Passos
            </h3>
            <ul className="space-y-4 text-zinc-300">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#0e9a20] rounded-full flex items-center justify-center text-black text-sm font-bold">
                  1
                </span>
                <span>Verifique seu e-mail - enviamos o voucher em PDF</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#0e9a20] rounded-full flex items-center justify-center text-black text-sm font-bold">
                  2
                </span>
                <span>Guarde o código do voucher ({voucher?.codigo || 'que receberá'})</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#0e9a20] rounded-full flex items-center justify-center text-black text-sm font-bold">
                  3
                </span>
                <span>Apresente o código na chegada ao restaurante</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#0e9a20] rounded-full flex items-center justify-center text-black text-sm font-bold">
                  4
                </span>
                <span>Aproveite sua experiência gastronômica!</span>
              </li>
            </ul>
          </div>

          <div className="bg-black rounded-lg p-6 mb-8 border border-zinc-700">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#0e9a20]" />
              Localização
            </h3>
            <p className="text-zinc-300 mb-2">
              <strong>Mortadella Ristorante & Pizzeria</strong>
            </p>
            <p className="text-zinc-400 mb-4">
              Av. Martin Luther, 1001 - Victor Konder<br />
              Blumenau/SC
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://wa.me/5547997660505"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#0e9a20] hover:bg-[#0a6b16] text-white px-4 py-2 rounded-lg transition text-sm font-medium"
              >
                WhatsApp: (47) 99766-0505
              </a>
              <a
                href="tel:+554730376060"
                className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
              >
                Telefone: (47) 3037-6060
              </a>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="inline-block bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-4 px-10 rounded-lg transition"
            >
              Voltar para o início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
