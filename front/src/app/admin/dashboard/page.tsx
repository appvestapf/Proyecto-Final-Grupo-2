"use client";

import React, { useEffect, useState } from 'react';
import { Home, Users, DollarSign, TrendingUp, Loader2, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardMetrics {
  monthlyRevenue: number;
  activeProperties: number;
  pendingReservations: number;
  occupancyRate: number;
  revenueData: { name: string; total: number }[];
  recentActivity: { id: string; user: string; property: string; status: string; date: string; amount: number }[];
}

const MetricCard = ({ title, value, icon: Icon, trend, prefix = '', suffix = '' }: any) => (
  <div className="bg-(--bg-surface) p-6 rounded-2xl border border-(--border-subtle) shadow-sm flex flex-col gap-4 transition-colors duration-200">
    <div className="flex items-start justify-between">
      <div className="p-3 bg-primary/10 text-primary rounded-xl">
        <Icon size={24} />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          trend >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
        }`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div>
      <h3 className="text-(--text-muted) text-sm font-medium">{title}</h3>
      <p className="text-3xl font-extrabold text-(--text-main) tracking-tight mt-1">
        {prefix}{value}{suffix}
      </p>
    </div>
  </div>
);

export default function DashboardOverviewPage() {
  const { token } = useAuthStore();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/reservations/admin/metrics`, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          cache: 'no-store' // <-- ESTO EVITA QUE LOS ADMINS VEAN LAS MÉTRICAS CACHEADAS DEL SUPER ADMIN
        });

        if (!response.ok) throw new Error("Error obteniendo métricas");
        
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error("Error al cargar métricas:", error);
        toast.error("No se pudieron cargar las métricas del panel");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchMetrics();
  }, [token]);

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center text-(--text-muted) gap-3">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p>Calculando métricas del sistema...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      <div>
        <h1 className="text-2xl font-bold text-(--text-main) tracking-tight">Bienvenido al Panel de Control</h1>
        <p className="text-(--text-muted) text-sm mt-1">Aquí tienes un resumen del rendimiento de tus inmuebles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Ingresos Totales" value={metrics?.monthlyRevenue.toLocaleString('es-AR')} prefix="US$ " icon={DollarSign} />
        <MetricCard title="Propiedades Activas" value={metrics?.activeProperties} icon={Home} />
        <MetricCard title="Reservas Pendientes" value={metrics?.pendingReservations} icon={Users} />
        <MetricCard title="Tasa de Ocupación" value={metrics?.occupancyRate} suffix="%" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRÁFICO DE INGRESOS */}
        <div className="lg:col-span-2 bg-(--bg-surface) rounded-2xl border border-(--border-subtle) shadow-sm p-6 min-h-[400px] flex flex-col transition-colors duration-200">
          <h3 className="text-lg font-bold text-(--text-main) mb-6">Ingresos (Últimos 6 meses)</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  cursor={{ fill: 'var(--bg-app)' }} 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    color: 'var(--text-main)',
                    borderRadius: '12px', 
                    border: '1px solid var(--border-subtle)', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }}
                  formatter={(value: any) => [`US$ ${Number(value).toLocaleString('es-AR')}`, 'Ingresos']} 
                />
                <Bar dataKey="total" fill="#0055FF" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ACTIVIDAD RECIENTE */}
        <div className="bg-(--bg-surface) rounded-2xl border border-(--border-subtle) shadow-sm p-6 min-h-[400px] flex flex-col transition-colors duration-200">
          <h3 className="text-lg font-bold text-(--text-main) mb-6">Actividad Reciente</h3>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-5">
            {metrics?.recentActivity?.length === 0 ? (
              <p className="text-sm text-(--text-muted) text-center mt-10">No hay actividad reciente.</p>
            ) : (
              metrics?.recentActivity?.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4">
                  
                  {/* Ícono de Estado */}
                  <div className={`p-2.5 rounded-full shrink-0 ${
                    activity.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' : 
                    activity.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 
                    'bg-rose-500/10 text-rose-500'
                  }`}>
                    {activity.status === 'confirmed' ? <CheckCircle2 size={18} /> : 
                     activity.status === 'pending' ? <Clock size={18} /> : 
                     <XCircle size={18} />}
                  </div>

                  {/* Datos del usuario y propiedad */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-(--text-main) truncate">{activity.user}</p>
                    <p className="text-xs text-(--text-muted) truncate">Reservó {activity.property}</p>
                  </div>

                  {/* Monto y Fecha */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-(--text-main)">US$ {activity.amount}</p>
                    <p className="text-[10px] font-medium text-(--text-muted)">
                      {new Date(activity.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}