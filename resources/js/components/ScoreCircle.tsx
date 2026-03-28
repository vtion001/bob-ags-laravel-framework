interface ScoreCircleProps {
    score: number;
    maxScore?: number;
}

export function ScoreCircle({ score, maxScore = 100 }: ScoreCircleProps) {
    const percentage = (score / maxScore) * 100;
    const color = percentage >= 70 ? 'text-green-500' : percentage >= 40 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className={`text-2xl font-bold ${color}`}>
            {score}/{maxScore}
        </div>
    );
}
