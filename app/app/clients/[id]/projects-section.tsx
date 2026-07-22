import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { PROJECT_STATUSES, STATUS_LABELS, type ProjectStatus } from "@/lib/status";
import {
  addMilestone,
  addProject,
  deleteMilestone,
  deleteProject,
  setMilestoneDone,
  setProjectStatus,
} from "../../projects/actions";

type Milestone = {
  id: string;
  title: string;
  done: boolean;
  due_date: string | null;
  sort_order: number;
};

type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  milestones: Milestone[];
};

export async function ProjectsSection({ clientId }: { clientId: string }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id, name, status, milestones ( id, title, done, due_date, sort_order )")
    .eq("client_id", clientId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const projects = (data ?? []) as unknown as Project[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>
          Status and milestones show on the client&rsquo;s portal the moment
          you change them.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {projects.map((project) => (
          <div key={project.id} className="rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{project.name}</p>
              <div className="flex items-center gap-2">
                <form
                  action={setProjectStatus.bind(null, project.id, clientId)}
                  className="flex items-center gap-2"
                >
                  <select
                    name="status"
                    defaultValue={project.status}
                    className="h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {PROJECT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" size="sm" variant="outline">
                    Update status
                  </Button>
                </form>
                <form action={deleteProject.bind(null, project.id, clientId)}>
                  <Button type="submit" size="sm" variant="ghost">
                    Delete
                  </Button>
                </form>
              </div>
            </div>

            <ul className="mt-3 flex flex-col gap-1">
              {[...project.milestones]
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((m) => (
                  <li key={m.id} className="flex items-center gap-2 text-sm">
                    <form
                      action={setMilestoneDone.bind(
                        null,
                        m.id,
                        clientId,
                        !m.done
                      )}
                    >
                      <button
                        type="submit"
                        aria-label={
                          m.done
                            ? `Mark "${m.title}" as not done`
                            : `Mark "${m.title}" as done`
                        }
                        className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                          m.done
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input"
                        }`}
                      >
                        {m.done ? "✓" : ""}
                      </button>
                    </form>
                    <span className={m.done ? "text-muted-foreground line-through" : ""}>
                      {m.title}
                    </span>
                    {m.due_date && (
                      <span className="font-mono text-xs text-muted-foreground">
                        {m.due_date}
                      </span>
                    )}
                    <form
                      action={deleteMilestone.bind(null, m.id, clientId)}
                      className="ml-auto"
                    >
                      <button
                        type="submit"
                        aria-label={`Delete milestone "${m.title}"`}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </button>
                    </form>
                  </li>
                ))}
            </ul>

            <form
              action={addMilestone.bind(null, project.id, clientId)}
              className="mt-3 flex flex-wrap items-center gap-2"
            >
              <Input
                name="title"
                placeholder="Add a milestone"
                required
                minLength={2}
                className="h-8 max-w-56 text-sm"
              />
              <Input
                name="due_date"
                type="date"
                className="h-8 w-36 text-sm"
              />
              <Button type="submit" size="sm" variant="outline">
                Add milestone
              </Button>
            </form>
          </div>
        ))}

        {projects.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No projects yet — add the first one so your client sees progress.
          </p>
        )}

        <form
          action={addProject.bind(null, clientId)}
          className="flex items-end gap-2 rounded-lg border bg-muted/40 p-3"
        >
          <div className="grid flex-1 gap-1.5">
            <label htmlFor="project-name" className="text-sm font-medium">
              New project
            </label>
            <Input
              id="project-name"
              name="name"
              placeholder="e.g. Brand refresh"
              required
              minLength={2}
            />
          </div>
          <Button type="submit">Add project</Button>
        </form>
      </CardContent>
    </Card>
  );
}
