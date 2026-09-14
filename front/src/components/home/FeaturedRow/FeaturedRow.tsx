"use client";
import { useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { CardInmueble } from '@/components/property/CardInmueble/CardInmueble';
import { Property } from '@/interfaces/property'; 

interface FeaturedRowProps {
  title: string;
  properties: Property[];
}

export const FeaturedRow = ({ title, properties }: FeaturedRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth + 24;
      const totalScroll = direction === 'left' ? -scrollAmount : scrollAmount;
      scrollRef.current.scrollBy({ left: totalScroll, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full py-8 px-6 md:px-12 lg:px-20">
      <div className="w-full flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-base-4 flex items-center gap-2 cursor-pointer hover:underline">
          {title} <ArrowRight size={22} />
        </h2>      
        <div className="hidden md:flex gap-3">
          <button 
            onClick={() => scroll('left')}
            className="p-2 rounded-full border border-slate-200 bg-white shadow-sm hover:shadow-md hover:bg-slate-50 transition-all cursor-pointer text-base-4"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-2 rounded-full border border-slate-200 bg-white shadow-sm hover:shadow-md hover:bg-slate-50 transition-all cursor-pointer text-base-4"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className="w-full overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden"
        >
          {properties.map((property) => (
            <div 
              key={property.id} 
              className="shrink-0 w-full md:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)] xl:w-[calc((100%-72px)/4)]"
            >
              <CardInmueble data={property} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};