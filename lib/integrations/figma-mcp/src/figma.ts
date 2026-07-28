const FIGMA_API_BASE = "https://api.figma.com/v1";

export interface FigmaConfig {
  accessToken: string;
}

export interface FigmaFile {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  document: FigmaNode;
  components: Record<string, FigmaComponent>;
  styles: Record<string, FigmaStyle>;
  schemaVersion: number;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  children?: FigmaNode[];
  [key: string]: unknown;
}

export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
  componentSetId: string | null;
  [key: string]: unknown;
}

export interface FigmaStyle {
  key: string;
  name: string;
  styleType: string;
  description: string;
  [key: string]: unknown;
}

export interface FigmaImageRenders {
  images: Record<string, string | null>;
}

export interface FigmaTeamProjects {
  name: string;
  projects: FigmaProject[];
}

export interface FigmaProject {
  id: string;
  name: string;
}

export interface FigmaProjectFiles {
  name: string;
  files: FigmaFileRef[];
}

export interface FigmaFileRef {
  key: string;
  name: string;
  lastModified: string;
  thumbnail_url: string;
}

export interface FigmaNodeResponse {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  nodes: Record<string, { document: FigmaNode } | null>;
}

export interface FigmaVariables {
  collections: FigmaVariableCollection[];
}

export interface FigmaVariableCollection {
  id: string;
  name: string;
  modes: { modeId: string; name: string }[];
  variables: Record<string, FigmaVariable>;
}

export interface FigmaVariable {
  id: string;
  name: string;
  key: string;
  variableCollectionId: string;
  resolvedType: string;
  valuesByMode: Record<string, unknown>;
}

export class FigmaClient {
  private config: FigmaConfig;
  private baseUrl: string;

  constructor(config: FigmaConfig) {
    this.config = config;
    this.baseUrl = FIGMA_API_BASE;
  }

  private get headers(): Record<string, string> {
    return {
      "X-Figma-Token": this.config.accessToken,
      "Content-Type": "application/json",
    };
  }

  private async request<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    const response = await fetch(url.toString(), { headers: this.headers });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(
        `Figma API error: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ""}`
      );
    }

    return response.json() as Promise<T>;
  }

  async getMe(): Promise<{ id: string; email: string; handle: string; img_url: string }> {
    return this.request("/me");
  }

  async getFile(fileKey: string, params?: { depth?: number; geometry?: string }): Promise<FigmaFile> {
    const queryParams: Record<string, string> = {};
    if (params?.depth !== undefined) queryParams.depth = String(params.depth);
    if (params?.geometry) queryParams.geometry = params.geometry;
    return this.request(`/files/${fileKey}`, queryParams);
  }

  async getFileNodes(
    fileKey: string,
    nodeIds: string[],
    params?: { depth?: number; geometry?: string }
  ): Promise<FigmaNodeResponse> {
    const queryParams: Record<string, string> = { ids: nodeIds.join(",") };
    if (params?.depth !== undefined) queryParams.depth = String(params.depth);
    if (params?.geometry) queryParams.geometry = params.geometry;
    return this.request(`/files/${fileKey}/nodes`, queryParams);
  }

  async getImages(
    fileKey: string,
    nodeIds: string[],
    params?: { scale?: number; format?: "jpg" | "png" | "svg" | "pdf" }
  ): Promise<FigmaImageRenders> {
    const queryParams: Record<string, string> = { ids: nodeIds.join(",") };
    if (params?.scale) queryParams.scale = String(params.scale);
    if (params?.format) queryParams.format = params.format;
    return this.request(`/images/${fileKey}`, queryParams);
  }

  async getFileComponents(fileKey: string): Promise<{ components: FigmaComponent[] }> {
    return this.request(`/files/${fileKey}/components`);
  }

  async getFileStyles(fileKey: string): Promise<{ styles: FigmaStyle[] }> {
    return this.request(`/files/${fileKey}/styles`);
  }

  async getTeamProjects(teamId: string): Promise<FigmaTeamProjects> {
    return this.request(`/teams/${teamId}/projects`);
  }

  async getProjectFiles(projectId: string): Promise<FigmaProjectFiles> {
    return this.request(`/projects/${projectId}/files`);
  }

  async getVariables(fileKey: string): Promise<FigmaVariables> {
    return this.request(`/files/${fileKey}/variables/local`);
  }

  async getFileVersions(fileKey: string): Promise<{ versions: { id: string; created_at: string; label: string; description: string }[] }> {
    return this.request(`/files/${fileKey}/versions`);
  }

  async getComments(fileKey: string): Promise<{ comments: unknown[] }> {
    return this.request(`/files/${fileKey}/comments`);
  }
}
