import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function DemoTokenSetup({
  isPending,
  onApply,
}: {
  isPending: boolean;
  onApply: () => void | Promise<void>;
}) {
  return (
    <Card className="border border-tc-orange/25 bg-tc-orange/5">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Add demo Fan Tokens
          </p>
          <p className="text-xs text-muted-foreground">
            Start with ARG, BRA, and CHZ stake so bonuses and eligibility light
            up.
          </p>
        </div>
        <Button onClick={onApply} disabled={isPending} className="shrink-0">
          {isPending ? "Adding..." : "Add demo stake"}
        </Button>
      </CardContent>
    </Card>
  );
}
