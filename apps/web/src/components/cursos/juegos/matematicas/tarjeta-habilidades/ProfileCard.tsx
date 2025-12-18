import { Skill } from '@/data/juegos/matematicas/skills-library';

interface ProfileCardProps {
  name: string;
  skills: Array<{ skill: Skill; color: string }>;
  mainStrength: { skill: Skill; color: string } | null;
}

export default function ProfileCard({ name, skills, mainStrength }: ProfileCardProps) {
  return (
    <div
      id="profile-card"
      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 max-w-2xl mx-auto border-2 border-slate-700 shadow-2xl"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-100 mb-2">{name}</h1>
        <p className="text-slate-400 text-lg">Explorador del Distrito Valor</p>
      </div>

      {/* Main Strength */}
      {mainStrength && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 mb-8 border-2 border-yellow-400/50 text-center">
          <div className="text-sm font-semibold text-yellow-400 mb-2">Mi Fortaleza Principal</div>
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl">{mainStrength.skill.icon}</span>
            <span className="text-3xl font-bold text-slate-100">{mainStrength.skill.label}</span>
          </div>
        </div>
      )}

      {/* Skills Grid */}
      <div>
        <h3 className="text-lg font-semibold text-slate-300 mb-4 text-center">Mis Habilidades</h3>
        <div className="flex flex-wrap gap-3 justify-center">
          {skills.map(({ skill, color }, index) => (
            <div
              key={index}
              className="px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 text-white"
              style={{ backgroundColor: color }}
            >
              <span className="text-base">{skill.icon}</span>
              <span>{skill.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-slate-700 text-center">
        <p className="text-slate-500 text-sm font-semibold">Ciudad MateAtleta</p>
        <p className="text-slate-600 text-xs mt-1">{new Date().toLocaleDateString('es-AR')}</p>
      </div>
    </div>
  );
}
