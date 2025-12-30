import { useEffect, useState } from "react";
import { X, AlertTriangle, Network } from "lucide-react";

interface Props {
    assetId: string | null;
    onClose: () => void;
}

export function AssetDependencyDrawer({ assetId, onClose }: Props) {
    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    const [relationships, setRelationships] = useState<any[]>([]);
    const [blastRadius, setBlastRadius] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!assetId) return;

        setLoading(true);

        Promise.all([
            fetch(`${API_BASE}/api/assets/${assetId}/relationships`).then(r => r.json()),
            fetch(`${API_BASE}/api/assets/${assetId}/blast-radius`).then(r => r.json())
        ])
            .then(([rels, blast]) => {
                setRelationships(rels || []);
                setBlastRadius(blast?.affected_assets || []);
            })
            .finally(() => setLoading(false));
    }, [assetId]);

    if (!assetId) return null;

    return (
        <div className="fixed inset-y-0 right-0 z-50 w-[520px] bg-white shadow-xl border-l">
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    Asset Dependencies
                </h3>
                <button onClick={onClose}>
                    <X />
                </button>
            </div>

            {loading ? (
                <div className="p-6">Loading relationships…</div>
            ) : (
                <div className="p-6 space-y-6">
                    {/* Direct Dependencies */}
                    <section>
                        <h4 className="font-semibold mb-2">Direct Dependencies</h4>
                        {relationships.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No dependencies found</p>
                        ) : (
                            <ul className="space-y-2">
                                {relationships.map((r, i) => (
                                    <li key={i} className="border rounded p-3">
                                        <div className="font-medium">{r.target_asset_name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {r.relationship_type} • Risk {r.risk_score}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {/* Blast Radius */}
                    <section>
                        <h4 className="font-semibold mb-2 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            Blast Radius
                        </h4>

                        {blastRadius.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No downstream impact</p>
                        ) : (
                            <ul className="space-y-2">
                                {blastRadius.map((a, i) => (
                                    <li key={i} className="border-l-4 border-red-500 pl-3">
                                        <div className="font-medium">{a.asset_name}</div>
                                        <div className="text-xs">
                                            Risk {a.risk_score} • Level {a.impact_level}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}