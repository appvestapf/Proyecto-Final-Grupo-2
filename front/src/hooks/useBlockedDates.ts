import { useState, useEffect, useCallback } from 'react';
import { reservationService, BlockedDateRange } from '@/services/reservationService';
import { parseISO, eachDayOfInterval, isSameDay } from 'date-fns';

export function useBlockedDates(propertyId?: string) {
  const [blockedRanges, setBlockedRanges] = useState<BlockedDateRange[]>([]);
  const [blockedDatesList, setBlockedDatesList] = useState<Date[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlockedDates = useCallback(async () => {
    if (!propertyId) {
      setBlockedRanges([]);
      setBlockedDatesList([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ranges = await reservationService.getBlockedDates(propertyId);
      setBlockedRanges(ranges);

      const allBlockedDays: Date[] = [];
      ranges.forEach((range) => {
        if (!range.startDate || !range.endDate) return;

        const start = parseISO(range.startDate.split('T')[0]);
        const end = parseISO(range.endDate.split('T')[0]);

        if (start <= end) {
          const daysInRange = eachDayOfInterval({ start, end });
          allBlockedDays.push(...daysInRange);
        }
      });

      setBlockedDatesList(allBlockedDays);
    } catch (err: any) {
      console.error(`Error en useBlockedDates (${propertyId}):`, err);
      setError(err.message || 'Error al cargar las fechas bloqueadas');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchBlockedDates();
  }, [fetchBlockedDates]);

  const isDateBlocked = useCallback(
    (targetDate: Date) => {
      return blockedDatesList.some((blockedDate) => isSameDay(blockedDate, targetDate));
    },
    [blockedDatesList]
  );

  return {
    blockedRanges,       // Rangos brutos devueltos por la API [{ startDate, endDate }]
    blockedDatesList,    // Array de objetos Date [] compatible con disabledDates en react-date-range
    isDateBlocked,       // Función helper (targetDate: Date) => boolean
    loading,             // Estado de carga booleano
    error,               // Mensaje de error si falla la llamada
    refetchBlockedDates: fetchBlockedDates, // Permite refrescar las fechas tras crear/cancelar una reserva
  };
}