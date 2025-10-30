import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAvailability } from "../../api/parking.api";

export default function AvailabilityPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["availability"],
    queryFn: getAvailability,
  });

  const groups = data?.result ?? [];

  return (
    <div>
      <h2 className="text-xl mb-4">Availability</h2>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {groups.map((g: any) => (
            <div key={g._id} className="p-4 bg-slate-800 rounded">
              <h3>Floor {g._id}</h3>
              <div className="flex gap-2 mt-2 flex-wrap">
                {g.spots.map((s: any) => (
                  <div
                    key={s.id}
                    className="px-3 py-1 bg-slate-700 rounded"
                  >
                    {s.code}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
