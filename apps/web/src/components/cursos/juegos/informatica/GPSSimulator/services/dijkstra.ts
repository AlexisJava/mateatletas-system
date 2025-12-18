import { Grafo, SimulationTimeline, FlowEdge, FlowNode } from '../types';

export function calculateFlows(grafo: Grafo): SimulationTimeline {
  const { nodos, aristas } = grafo;
  const startNode = nodos.find((n) => n.esInicio)!;
  const endNode = nodos.find((n) => n.esDestino)!;

  // 1. Initialize Dijkstra Structures
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();
  const timelineNodes = new Map<string, FlowNode>();

  nodos.forEach((n) => {
    dist.set(n.id, Infinity);
    prev.set(n.id, null);
    timelineNodes.set(n.id, {
      id: n.id,
      discoveryTime: Infinity,
      isOptimal: false,
      predecessor: null,
    });
  });

  dist.set(startNode.id, 0);
  timelineNodes.get(startNode.id)!.discoveryTime = 0;

  // Priority Queue (using simple array sort for simplicity)
  const pq: { id: string; cost: number }[] = [{ id: startNode.id, cost: 0 }];

  // We also want to track ALL edges that get "filled", even if they don't lead to optimal
  const timelineEdges: FlowEdge[] = [];

  while (pq.length > 0) {
    // Pop min
    pq.sort((a, b) => a.cost - b.cost);
    const { id: u, cost: d_u } = pq.shift()!;

    if (d_u > (dist.get(u) ?? Infinity)) continue;
    visited.add(u);

    // If we hit target, we continue (to fill other pipes for visual effect),
    // but strictly we could stop. For "Fluid" sim, we want to see the wave spread.
    // However, to keep it clean, let's process everything reachable.

    // Find neighbors
    const neighbors = aristas.filter((a) => a.desde === u || a.hasta === u);

    for (const edge of neighbors) {
      const v = edge.desde === u ? edge.hasta : edge.desde;

      // Visual: Fluid enters edge at T = dist[u]
      // Fluid arrives at v at T = dist[u] + edge.costo
      const startTime = d_u;
      const endTime = d_u + edge.costo;

      // Add to visualization timeline (Edge fills up)
      timelineEdges.push({
        id: `${u}-${v}`,
        from: u,
        to: v,
        cost: edge.costo,
        startTime,
        endTime,
        isOptimal: false, // calculated later
      });

      // Dijkstra Relaxation
      if (endTime < (dist.get(v) ?? Infinity)) {
        dist.set(v, endTime);
        prev.set(v, u);

        // Update Node Metadata
        const vNode = timelineNodes.get(v)!;
        vNode.discoveryTime = endTime;
        vNode.predecessor = u;

        pq.push({ id: v, cost: endTime });
      }
    }
  }

  // 2. Reconstruct Path
  const optimalPath: string[] = [];
  let curr: string | null = endNode.id;
  if (dist.get(endNode.id) !== Infinity) {
    while (curr) {
      optimalPath.unshift(curr);
      const nodeData = timelineNodes.get(curr);
      if (nodeData) nodeData.isOptimal = true;
      curr = prev.get(curr) || null;
    }
  }

  // 3. Mark Optimal Edges
  // We need to match the specific edge segment that was used in the shortest path
  for (let i = 0; i < optimalPath.length - 1; i++) {
    const u = optimalPath[i];
    const v = optimalPath[i + 1];

    // Find the edge entry that corresponds to the optimal timing
    // The edge used is the one where endTime == dist[v] and from == u
    const correctEdge = timelineEdges.find(
      (e) => e.from === u && e.to === v && Math.abs(e.endTime - (dist.get(v) || 0)) < 0.001,
    );

    if (correctEdge) {
      correctEdge.isOptimal = true;
    }
  }

  // Calculate max time for the slider
  const maxTime = Math.max(
    ...timelineEdges.map((e) => e.endTime),
    dist.get(endNode.id) === Infinity ? 0 : dist.get(endNode.id)!,
  );

  return {
    edges: timelineEdges,
    nodes: timelineNodes,
    maxTime: maxTime + 5, // Buffer
    optimalPath,
  };
}
