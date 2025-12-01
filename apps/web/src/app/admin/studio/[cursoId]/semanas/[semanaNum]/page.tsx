import { SemanaEditor } from '@/components/studio/editor';

interface Props {
  params: Promise<{ cursoId: string; semanaNum: string }>;
}

export default async function EditorSemanaPage({ params }: Props): Promise<React.ReactElement> {
  const { cursoId, semanaNum } = await params;

  return (
    <div className="h-screen">
      <SemanaEditor cursoId={cursoId} semanaNum={parseInt(semanaNum, 10)} />
    </div>
  );
}
