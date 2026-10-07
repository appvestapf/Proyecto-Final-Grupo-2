import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import OpenAI from 'openai';
import { PropertiesService } from '../properties/properties.service';
import { VESTA_SYSTEM_PROMPT } from './prompts/system.prompt';

@Injectable()
export class ChatbotService {
  private readonly ai: OpenAI;

  private readonly searchPropertiesTool = {
    type: 'function' as const,
    function: {
      name: 'search_properties',
      description: 'Busca propiedades disponibles en Vesta según los filtros proporcionados por el usuario.',
      parameters: {
        type: 'object',
        properties: {
          keyword: { type: 'string', description: 'Palabra clave del tipo o nombre de propiedad, por ejemplo casa o departamento.' },
          country: { type: 'string', description: 'País donde se encuentra la propiedad.' },
          city: { type: 'string', description: 'Ciudad donde se encuentra la propiedad.' },
          rentalType: { type: 'string', enum: ['temporario', 'residencial'], description: 'Tipo de alquiler. Temporario para estadías cortas y residencial para alquiler mensual.' },
          priceUnit: { type: 'string', enum: ['noche', 'mes'], description: 'Unidad del precio.' },
          minPrice: { type: 'number', description: 'Precio mínimo por noche o mes.' },
          maxPrice: { type: 'number', description: 'Precio máximo por noche o mes.' },
          maxTotalPrice: { type: 'number', description: 'Presupuesto máximo total de la estadía.' },
          durationDays: { type: 'number', description: 'Duración de la estadía en días. Una semana equivale a 7 días.' },
          capacity: { type: 'number', description: 'Cantidad mínima de personas.' },
          rooms: { type: 'number', description: 'Cantidad mínima de habitaciones.' },
          bathrooms: { type: 'number', description: 'Cantidad mínima de baños.' },
          isPetFriendly: { type: 'boolean', description: 'Si la propiedad debe aceptar mascotas.' },
          hasGarage: { type: 'boolean', description: 'Si la propiedad debe tener cochera.' },
        },
        additionalProperties: false,
      },
    },
  };

  constructor(private readonly propertiesService: PropertiesService) {
    this.ai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  // Agregamos `userName` y `history` como parámetros opcionales para no romper el controlador actual
  async chat(message: string, userName?: string, history: any[] = []) {
    try {
      // Inyectamos dinámicamente el nombre del usuario si existe
      const promptConContexto = VESTA_SYSTEM_PROMPT + `\n\nEl usuario con el que estás hablando se llama ${userName || 'Visitante'}. Tratalo por su nombre.`;

      const messages: any[] = [
        {
          role: 'system',
          content: promptConContexto,
        },
        ...history, // Agregamos la memoria de la conversación previa
        {
          role: 'user',
          content: message,
        },
      ];

      const response = await this.ai.chat.completions.create({
        model: 'openai/gpt-oss-20b',
        messages,
        tools: [this.searchPropertiesTool],
        tool_choice: 'auto',
      });

      const toolCall = response.choices[0]?.message?.tool_calls?.[0];

      if (!toolCall || toolCall.type !== 'function') {
        return {
          message: response.choices[0]?.message?.content,
        };
      }

      const filters = JSON.parse(toolCall.function.arguments);

      console.log('FILTROS GENERADOS POR GROQ:');
      console.log(filters);

      const properties = await this.propertiesService.searchForChatbot(filters);

      const chatbotProperties = properties.map((property) => ({
        id: property.id,
        name: property.name,
        description: property.description,
        price: property.price,
        priceUnit: property.priceUnit,
        country: property.country,
        city: property.city,
        rentalType: property.rentalType,
        capacity: property.capacity,
        rooms: property.rooms,
        bathrooms: property.bathrooms,
        area: property.area,
        rating: property.rating,
        isPetFriendly: property.isPetFriendly,
        hasGarage: property.hasGarage,
        image: property.images?.[0] ?? null,
      }));

      console.log('PROPIEDADES ENCONTRADAS:');
      console.log(properties);

      messages.push(response.choices[0].message);

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(chatbotProperties),
      });

      const finalResponse = await this.ai.chat.completions.create({
        model: 'openai/gpt-oss-20b',
        messages,
      });

      return {
        message: finalResponse.choices[0]?.message?.content,
        properties: chatbotProperties
      };
    } catch (error) {
      console.error('========== ERROR DE GROQ ==========');
      console.error(error);
      console.error('====================================');

      throw new ServiceUnavailableException(
        'El servicio de IA no está disponible temporalmente.',
      );
    }
  }
}