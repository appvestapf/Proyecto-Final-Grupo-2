import React from 'react';
import { Home, Users, DollarSign, TrendingUp } from 'lucide-react';

const MetricCard = ({ title, value, icon: Icon, trend }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
    <div className="flex items-start justify-between">
      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
        <Icon size={24} />
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div>
      <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">{value}</p>
    </div>
  </div>
);

export default function DashboardOverviewPage() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bienvenido al Panel de Control</h1>
        <p className="text-slate-500 text-sm mt-1">Aquí tienes un resumen del rendimiento de tus inmuebles.</p>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Ingresos (Mes)" value="US$ 4,250" icon={DollarSign} trend={12.5} />
        <MetricCard title="Propiedades Activas" value="12" icon={Home} trend={0} />
        <MetricCard title="Reservas Pendientes" value="3" icon={Users} />
        <MetricCard title="Tasa de Ocupación" value="85%" icon={TrendingUp} trend={5.2} />
      </div>

      {/* Área para tablas o gráficos futuros */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[300px] flex items-center justify-center">
          <p className="text-slate-400 font-medium text-sm">Aquí irá el gráfico de ingresos mensuales</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[300px] flex items-center justify-center">
          <p className="text-slate-400 font-medium text-sm">Actividad Reciente</p>
        </div>
      </div>

    </div>
  );
}