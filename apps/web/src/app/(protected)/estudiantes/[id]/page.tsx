'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEstudiantesStore } from '@/store/estudiantes.store';
import { Button, Avatar, Badge, Card } from '@/components/ui';
import { ArrowLeft, Edit, Trash2, Award, TrendingUp } from 'lucide-react';

/**
 * Página de perfil de estudiante
 * Muestra información detallada del estudiante
 */
export default function EstudianteProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { estudianteActual, isLoading, fetchEstudianteById, deleteEstudiante } =
    useEstudiantesStore();

  const id = params.id as string;

  useEffect(() => {
    if (id) {
      fetchEstudianteById(id);
    }
  }, [id, fetchEstudianteById]);

  const calcularEdad = () => {
    if (!estudianteActual) return 0;
    const hoy = new Date();
    const nacimiento = new Date(estudianteActual.fecha_nacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de eliminar este estudiante?')) {
      try {
        await deleteEstudiante(id);
        router.push('/estudiantes');
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  if (isLoading || !estudianteActual) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </Button>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push(`/estudiantes?edit=${id}`)}
          >
            <Edit className="w-5 h-5 mr-2" />
            Editar
          </Button>
          <Button variant="ghost" onClick={handleDelete} className="text-red-600">
            <Trash2 className="w-5 h-5 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="p-8">
        <div className="flex items-start gap-6 mb-8">
          <Avatar
            src={estudianteActual.foto_url}
            alt={`${estudianteActual.nombre} ${estudianteActual.apellido}`}
            size="xl"
            fallback={`${estudianteActual.nombre.charAt(0)}${estudianteActual.apellido.charAt(0)}`}
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#2a1a5e] mb-2">
              {estudianteActual.nombre} {estudianteActual.apellido}
            </h1>
            <p className="text-gray-600 text-lg">{calcularEdad()} años</p>
            <div className="flex gap-3 mt-4">
              <Badge variant="info">{estudianteActual.nivel_escolar}</Badge>
              {estudianteActual.equipo && (
                <Badge variant="default">
                  <span style={{ color: estudianteActual.equipo.color_primario }}>
                    Equipo {estudianteActual.equipo.nombre}
                  </span>
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[#f7b801]/10 to-[#ff6b35]/10 p-6 rounded-xl border-4 border-black">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-6 h-6 text-[#f7b801]" />
              <h3 className="font-bold text-[#2a1a5e]">Puntos Totales</h3>
            </div>
            <p className="text-4xl font-bold text-[#f7b801]">
              {estudianteActual.puntos_totales}
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#00d9ff]/10 to-[#2a1a5e]/10 p-6 rounded-xl border-4 border-black">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-[#00d9ff]" />
              <h3 className="font-bold text-[#2a1a5e]">Nivel Actual</h3>
            </div>
            <p className="text-4xl font-bold text-[#00d9ff]">
              {estudianteActual.nivel_actual}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
