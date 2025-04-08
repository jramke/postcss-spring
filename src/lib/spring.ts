export function generateSpring(bounce: number): {
    ease: string;
    durationMultiplier: number;
} {
    const perceptualDuration = 1000;

    const stiffness = ((2 * Math.PI) / (perceptualDuration / 1000)) ** 2;

    const damping = ((1 - bounce / 100) * 4 * Math.PI) / (perceptualDuration / 1000);

    const springSolver = createSpringSolver({
        mass: 1,
        stiffness,
        damping,
        velocity: 0,
    });
    const settlingDuration = calculateSettlingDuration(springSolver, perceptualDuration);

    const springValues = generateSpringValues(springSolver, settlingDuration);
    return {
        ease: generateLinearSyntax(normalizeTime(springValues, settlingDuration), 4),
        durationMultiplier: (settlingDuration / perceptualDuration) * 1000,
    };
}

function calculateSettlingDuration(
    solver: (t: number) => number,
    perceptualDuration: number
): number {
    const step = 1 / 8;
    let time = (perceptualDuration * 1.66) / 1000;

    while (true) {
        if (Math.abs(1 - solver(time)) < 0.001) {
            const restStart = time;
            let restSteps = 1;
            while (true) {
                time += step;
                if (Math.abs(1 - solver(time)) >= 0.0005) break;
                restSteps++;
                if (restSteps === 20) return restStart;
            }
        }
        time += step;
        if (time > 30) return 30;
    }
}

function createSpringSolver({
    mass,
    stiffness,
    damping,
    velocity,
}: {
    mass: number;
    stiffness: number;
    damping: number;
    velocity: number;
}): (t: number) => number {
    const w0 = Math.sqrt(stiffness / mass);
    const zeta = damping / (2 * Math.sqrt(stiffness * mass));
    const wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
    const b = zeta < 1 ? (zeta * w0 - velocity) / wd : -velocity + w0;

    function solver(t: number): number {
        let displacement;

        if (zeta < 1) {
            displacement = Math.exp(-t * zeta * w0) * (Math.cos(wd * t) + b * Math.sin(wd * t));
        } else {
            displacement = (1 + b * t) * Math.exp(-t * w0);
        }

        return 1 - displacement;
    }

    return solver;
}

function generateSpringValues(
    springSolver: (t: number) => number,
    settlingDuration: number
): [number, number][] {
    const samples = settlingDuration * 500;
    let values: [number, number][] = [];

    for (let i = 0; i <= settlingDuration; i += 1 / samples) {
        values.push([i, springSolver(i)]);
    }
    values = simplifyDouglasPeucker(values, 0.001);

    return values;
}

function normalizeTime(points: [number, number][], settlingDuration: number): [number, number][] {
    // Normalize time to 0-1
    return points.map(([time, value]) => [time / settlingDuration, value]);
}

function generateLinearSyntax(points: [number, number][], round: number): string {
    const xFormat = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: Math.max(round - 2, 0),
    });
    const yFormat = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: round,
    });

    const valuesWithRedundantX = new Set<[number, number]>();
    const maxDelta = 1 / 10 ** round;

    for (let i = 0; i < points.length; i++) {
        const [x] = points[i];
        if (i === 0) {
            if (x === 0) valuesWithRedundantX.add(points[i]);
            continue;
        }
        if (i === points.length - 1) {
            const previous = points[i - 1][0];
            if (x === 1 && previous <= 1) valuesWithRedundantX.add(points[i]);
            continue;
        }

        const previous = points[i - 1][0];
        const next = points[i + 1][0];

        const averagePos = (next - previous) / 2 + previous;
        const delta = Math.abs(x - averagePos);

        if (delta < maxDelta) valuesWithRedundantX.add(points[i]);
    }

    const groupedValues: [number, number][][] = [[points[0]]];

    for (const value of points.slice(1)) {
        if (value[1] === groupedValues.at(-1)![0][1]) {
            groupedValues.at(-1)!.push(value);
        } else {
            groupedValues.push([value]);
        }
    }

    const outputValues = groupedValues.map(group => {
        const yValue = yFormat.format(group[0][1]);

        const regularValue = group
            .map(value => {
                const [x] = value;
                let output = yValue;

                if (!valuesWithRedundantX.has(value)) {
                    output += ' ' + xFormat.format(x * 100) + '%';
                }

                return output;
            })
            .join(', ');

        if (group.length === 1) return regularValue;

        const xVals = [group[0][0], group.at(-1)![0]];
        const positionalValues = xVals.map(x => xFormat.format(x * 100) + '%').join(' ');

        const skipValue = `${yValue} ${positionalValues}`;

        return skipValue.length > regularValue.length ? regularValue : skipValue;
    });
    return `linear(${outputValues.join(', ')})`;
}

function getSqSegDist(p: [number, number], p1: [number, number], p2: [number, number]): number {
    let x = p1[0];
    let y = p1[1];
    let dx = p2[0] - x;
    let dy = p2[1] - y;

    if (dx !== 0 || dy !== 0) {
        const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);

        if (t > 1) {
            x = p2[0];
            y = p2[1];
        } else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }

    dx = p[0] - x;
    dy = p[1] - y;

    return dx * dx + dy * dy;
}

function simplifyDPStep(
    points: [number, number][],
    first: number,
    last: number,
    sqTolerance: number,
    simplified: [number, number][]
): void {
    let maxSqDist = sqTolerance;
    let index: number | undefined;

    for (let i = first + 1; i < last; i++) {
        const sqDist = getSqSegDist(points[i], points[first], points[last]);

        if (sqDist > maxSqDist) {
            index = i;
            maxSqDist = sqDist;
        }
    }

    if (maxSqDist > sqTolerance) {
        if (index! - first > 1) {
            simplifyDPStep(points, first, index!, sqTolerance, simplified);
        }

        simplified.push(points[index!]);

        if (last - index! > 1) {
            simplifyDPStep(points, index!, last, sqTolerance, simplified);
        }
    }
}

function simplifyDouglasPeucker(points: [number, number][], tolerance: number): [number, number][] {
    if (points.length <= 1) return points;
    const sqTolerance = tolerance * tolerance;
    const last = points.length - 1;
    const simplified: [number, number][] = [points[0]];
    simplifyDPStep(points, 0, last, sqTolerance, simplified);
    simplified.push(points[last]);

    return simplified;
}
