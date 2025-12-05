import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface Project {
    id: string;
    name: string;
    description?: string;
    creatorId: string;
    creatorName?: string;
    departmentId: string;
    departmentName?: string;
    createdAt?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    departmentId?: string;
    departmentName?: string;
}

export interface Department {
    id: string;
    name: string;
    manager: string;
    projects: Project[];
    subDepartments?: Department[];
}

export interface DashboardStats {
    // Row 1
    deploymentStatus: { status: string; count: number }[];
    gpuUsage: { environment: string; avg_gpu: number; deployment_count: number }[];
    idleModelsCount: number;

    // Row 2
    roleDistribution: { role: string; count: number }[];
    projectsByDept: { department_name: string; project_count: number }[];
    stakeholders: { user_id: string; user_name: string; role: string; department_name?: string }[];

    // Row 3
    highCostSessions: { session_id: string; user_name?: string; token_used: number; request_time: string }[];
    powerUsers: { user_id: string; user_name: string; session_count: number }[];
    liveIssues: { user_id: string; user_name: string; department_name?: string }[];
}

export const SessionStatus = {
    IN_PROGRESS: "진행중",
    COMPLETED: "완료",
    ERROR: "오류",
    STOPPED: "중단"
} as const;
export type SessionStatus = typeof SessionStatus[keyof typeof SessionStatus];

export const SessionType = {
    DEVELOPMENT: "개발",
    PRODUCTION: "프로덕션",
    TEST: "테스트",
    EXPERIMENTAL: "실험"
} as const;
export type SessionType = typeof SessionType[keyof typeof SessionType];

export interface Session {
    session_id: string;
    session_type: SessionType;
    status: SessionStatus;
    user_id: string;
    project_id?: string;
    start_time: string;
    end_time?: string;
    user_name?: string;
    project_name?: string;
}

export interface SessionLog {
    session_id: string;
    log_sequence: number;
    request_prompt_s3_path: string;
    response_s3_path: string;
    token_used: number;
    config_id?: string;
    deployment_id: string;
    request_time: string;
    response_time: string;
    config_max_tokens?: number;
    config_temperature?: number;
    config_top_p?: number;
    config_top_k?: number;
    deployment_server?: string;
}

export interface Model {
    model_id: string;
    model_name: string;
    model_type: string;
}

export interface Deployment {
    deployment_id: string;
    server_name: string;
    gpu_count: number;
    environment: string;
    status: string;
    model_id: string;
    dataset_id?: string;
}

export interface Dataset {
    dataset_id: string;
    learning_type: string;
    description?: string;
    s3_path: string;
    created_at?: string;
}

export interface PromptTemplate {
    template_id: string;
    template_name: string;
    prompt_s3_path: string;
    description?: string;
    task_category: string;
    variables?: string;
    version: string;
    creator_user_id: string;
    creator_user_name?: string;
    usage_count: number;
    created_at?: string;
}

export interface DataState {
    users: User[];
    departmentUsers: User[];
    departments: Department[];
    projects: Project[];
    sessions: Session[];
    currentSessionLogs: SessionLog[];
    dashboardStats: DashboardStats | null;

    // Users
    fetchUsers: (searchParams?: { userName?: string; role?: string; departmentId?: string }) => Promise<void>;
    fetchDepartmentUsers: (departmentId: string) => Promise<void>;
    createUser: (user: Omit<User, 'id'>, refreshParams?: { userName?: string; role?: string; departmentId?: string }) => Promise<void>;
    updateUser: (id: string, user: Partial<User>, refreshParams?: { userName?: string; role?: string; departmentId?: string }) => Promise<void>;
    deleteUser: (id: string, refreshParams?: { userName?: string; role?: string; departmentId?: string }) => Promise<void>;

    // Departments
    fetchDepartments: () => Promise<void>;
    createDepartment: (dept: Omit<Department, 'id'>) => Promise<void>;
    updateDepartment: (id: string, dept: Partial<Department> & { managerId?: string }) => Promise<void>;
    deleteDepartment: (id: string) => Promise<void>;

    // Dashboard
    fetchDashboardStats: () => Promise<void>;

    // Projects
    fetchProjects: (searchParams?: { projectName?: string; creatorName?: string; departmentName?: string }) => Promise<void>;
    createProject: (project: Omit<Project, 'id'>) => Promise<void>;
    updateProject: (id: string, project: Partial<Project>) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;

    // Sessions
    fetchSessions: (filters?: { userName?: string; projectName?: string; type?: SessionType; status?: SessionStatus }) => Promise<void>;
    fetchSessionsByProject: (projectId: string) => Promise<void>;
    deleteSession: (sessionId: string) => Promise<void>;
    fetchSessionLogs: (sessionId: string) => Promise<void>;
    deleteSessionLog: (sessionId: string, logSequence: number) => Promise<void>;

    // Templates
    templates: PromptTemplate[];
    fetchTemplates: (searchParams?: { templateName?: string; creatorName?: string }) => Promise<void>;
    createTemplate: (template: Omit<PromptTemplate, 'template_id'>) => Promise<void>;
    deleteTemplate: (templateId: string) => Promise<void>;

    // Models
    models: Model[];
    fetchModels: () => Promise<void>;
    createModel: (model: Omit<Model, 'model_id'>) => Promise<void>;
    updateModel: (modelId: string, model: Partial<Model>) => Promise<void>;
    deleteModel: (modelId: string) => Promise<void>;

    // Deployments
    currentDeployments: Deployment[];
    fetchDeploymentsByModel: (modelId: string) => Promise<void>;
    createDeployment: (deployment: Omit<Deployment, 'deployment_id'>) => Promise<void>;
    updateDeployment: (deploymentId: string, deployment: Partial<Deployment>) => Promise<void>;
    deleteDeployment: (deploymentId: string) => Promise<void>;

    // Datasets
    datasets: Dataset[];
    fetchDatasets: (searchParams?: { datasetName?: string; learningType?: string }) => Promise<void>;
    createDataset: (dataset: Omit<Dataset, 'dataset_id'>) => Promise<void>;
    updateDataset: (datasetId: string, dataset: Partial<Dataset>) => Promise<void>;
    deleteDataset: (datasetId: string) => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
    users: [],
    departmentUsers: [],
    departments: [],
    projects: [],
    sessions: [],
    currentSessionLogs: [],
    dashboardStats: null,

    fetchUsers: async (searchParams) => {
        try {
            let url = searchParams?.departmentId
                ? `${API_URL}/api/v1/users/department/${searchParams.departmentId}`
                : `${API_URL}/api/v1/users/`;

            const params: any = {};
            if (searchParams?.userName) params.user_name = searchParams.userName;
            if (searchParams?.role) params.role = searchParams.role;

            const response = await axios.get(url, { params });
            const users = response.data.map((u: any) => ({
                id: u.user_id,
                name: u.user_name,
                email: u.user_email,
                departmentId: u.department_id,
                departmentName: u.department_name || '',
                role: u.role,
                isActive: u.is_active === 'Y',
            }));
            set({ users });
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    },

    fetchDepartmentUsers: async (departmentId: string) => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/users/department/${departmentId}`);
            const departmentUsers = response.data.map((u: any) => ({
                id: u.user_id,
                name: u.user_name,
                email: u.user_email,
                departmentId: u.department_id,
                departmentName: u.department_name || '',
                role: u.role,
                isActive: u.is_active === 'Y',
            }));
            set({ departmentUsers });
        } catch (error) {
            console.error('Failed to fetch department users:', error);
            set({ departmentUsers: [] });
        }
    },

    fetchDepartments: async () => {
        try {
            const [deptRes, projRes] = await Promise.all([
                axios.get(`${API_URL}/api/v1/departments/`),
                axios.get(`${API_URL}/api/v1/projects/`)
            ]);

            const projects = projRes.data;
            const departments = deptRes.data.map((d: any) => ({
                id: d.department_id,
                name: d.department_name,
                manager: d.manager_name || 'Unassigned',
                projects: projects.filter((p: any) => p.department_id === d.department_id).map((p: any) => ({
                    id: p.project_id,
                    name: p.project_name,
                    description: p.project_description || ''
                })),
                subDepartments: [], // Backend is flat
            }));
            set({ departments });
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        }
    },

    fetchDashboardStats: async () => {
        try {
            const [
                deployStatusRes,
                gpuRes,
                idleModelsRes,
                roleDistRes,
                projDeptRes,
                stakeholdersRes,
                highCostRes,
                powerUsersRes,
                liveIssuesRes
            ] = await Promise.all([
                axios.get(`${API_URL}/api/v1/deployments/stats/q1/status-count`),
                axios.get(`${API_URL}/api/v1/deployments/stats/q9`),
                axios.get(`${API_URL}/api/v1/models/stats/q10`),
                axios.get(`${API_URL}/api/v1/users/stats/role-distribution`),
                axios.get(`${API_URL}/api/v1/projects/stats/by-department`),
                axios.get(`${API_URL}/api/v1/users/stats/role-and-managers`),
                axios.get(`${API_URL}/api/v1/sessions/stats/logs-by-token?limit=5`),
                axios.get(`${API_URL}/api/v1/users/stats/min-sessions?limit=5`),
                axios.get(`${API_URL}/api/v1/users/stats/with-sessions?session_status=오류`) // Or 'STOPPED' if needed, maybe fetch both or handle in backend
            ]);

            const stoppedRes = await axios.get(`${API_URL}/api/v1/users/stats/with-sessions?session_status=중단`);

            // Merge live issues (unique users)
            const errorUsers = liveIssuesRes.data;
            const stoppedUsers = stoppedRes.data;
            const allIssueUsers = [...errorUsers, ...stoppedUsers];
            // Deduplicate by user_id
            const uniqueIssueUsers = Array.from(new Map(allIssueUsers.map((item: any) => [item.user_id, item])).values());

            set({
                dashboardStats: {
                    deploymentStatus: deployStatusRes.data,
                    gpuUsage: gpuRes.data,
                    idleModelsCount: idleModelsRes.data.length,
                    roleDistribution: roleDistRes.data,
                    projectsByDept: projDeptRes.data,
                    stakeholders: stakeholdersRes.data,
                    highCostSessions: highCostRes.data,
                    powerUsers: powerUsersRes.data,
                    liveIssues: uniqueIssueUsers as any // Type assertion for now
                }
            });

            if (get().users.length === 0) {
                await get().fetchUsers();
            }
            const allUsers = get().users;

            const stakeholderIds = stakeholdersRes.data.map((s: any) => s.user_id);
            const enrichedStakeholders = allUsers.filter(u => stakeholderIds.includes(u.id)).map(u => ({
                user_id: u.id,
                user_name: u.name,
                role: u.role,
                department_name: u.departmentName
            }));

            set(state => ({
                dashboardStats: state.dashboardStats ? {
                    ...state.dashboardStats,
                    stakeholders: enrichedStakeholders
                } : null
            }));

        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        }
    },


    fetchProjects: async (searchParams) => {
        try {
            let url = `${API_URL}/api/v1/projects/`;
            const params: any = {};

            if (searchParams) {
                url = `${API_URL}/api/v1/projects/search`;
                if (searchParams.projectName) params.project_name = searchParams.projectName;
                if (searchParams.creatorName) params.creator_user_name = searchParams.creatorName;
                if (searchParams.departmentName) params.department_name = searchParams.departmentName;
            }

            const response = await axios.get(url, { params });
            const projects = response.data.map((p: any) => ({
                id: p.project_id,
                name: p.project_name,
                description: p.description,
                creatorId: p.creator_user_id,
                departmentId: p.department_id,
                createdAt: p.created_at
            }));
            set({ projects });
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        }
    },
    createProject: async (project) => {
        try {
            await axios.post(`${API_URL}/api/v1/projects/`, {
                project_name: project.name,
                description: project.description,
                creator_user_id: project.creatorId,
                department_id: project.departmentId
            });
            get().fetchProjects();
        } catch (error) {
            console.error('Failed to create project:', error);
        }
    },
    updateProject: async (id, project) => {
        try {
            await axios.put(`${API_URL}/api/v1/projects/${id}`, {
                project_name: project.name,
                description: project.description
            });
            get().fetchProjects();
        } catch (error) {
            console.error('Failed to update project:', error);
        }
    },
    deleteProject: async (id) => {
        try {
            await axios.delete(`${API_URL}/api/v1/projects/${id}`);
            get().fetchProjects();
        } catch (error) {
            console.error('Failed to delete project:', error);
        }
    },

    createUser: async (user, refreshParams) => {
        await axios.post(`${API_URL}/api/v1/users/`, {
            user_name: user.name,
            user_email: user.email,
            role: user.role,
            department_id: user.departmentId
        });
        get().fetchUsers(refreshParams);
    },

    updateUser: async (id, user, refreshParams) => {
        await axios.put(`${API_URL}/api/v1/users/${id}`, {
            user_name: user.name,
            user_email: user.email,
            role: user.role,
            is_active: user.isActive ? 'Y' : 'N',
            department_id: user.departmentId
        });
        get().fetchUsers(refreshParams);
    },

    deleteUser: async (id, refreshParams) => {
        await axios.delete(`${API_URL}/api/v1/users/${id}`);
        get().fetchUsers(refreshParams);
    },

    createDepartment: async (dept) => {
        await axios.post(`${API_URL}/api/v1/departments/`, {
            department_name: dept.name
        });
        get().fetchDepartments();
    },

    updateDepartment: async (id, dept) => {
        await axios.put(`${API_URL}/api/v1/departments/${id}`, {
            department_name: dept.name,
            manager_user_id: dept.managerId
        });
        get().fetchDepartments();
    },

    deleteDepartment: async (id) => {
        await axios.delete(`${API_URL}/api/v1/departments/${id}`);
        get().fetchDepartments();
    },

    fetchSessions: async (filters) => {
        try {
            const params: any = {};
            if (filters?.userName) params.user_name = filters.userName;
            if (filters?.projectName) params.project_name = filters.projectName;
            if (filters?.type) params.session_type = filters.type;
            if (filters?.status) params.status = filters.status;

            const response = await axios.get(`${API_URL}/api/v1/sessions/search`, { params });
            set({ sessions: response.data });
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        }
    },

    fetchSessionsByProject: async (projectId) => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/sessions/project/${projectId}`);
            set({ sessions: response.data });
        } catch (error) {
            console.error('Failed to fetch project sessions:', error);
        }
    },

    deleteSession: async (sessionId) => {
        try {
            await axios.delete(`${API_URL}/api/v1/sessions/${sessionId}`);
            // Refresh sessions list
            const currentSessions = get().sessions;
            set({ sessions: currentSessions.filter(s => s.session_id !== sessionId) });
        } catch (error) {
            console.error('Failed to delete session:', error);
        }
    },

    fetchSessionLogs: async (sessionId) => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/sessions/${sessionId}/logs`);
            set({ currentSessionLogs: response.data });
        } catch (error) {
            console.error('Failed to fetch session logs:', error);
        }
    },

    deleteSessionLog: async (sessionId, logSequence) => {
        try {
            await axios.delete(`${API_URL}/api/v1/sessions/${sessionId}/logs/${logSequence}`);
            // Refresh logs
            const currentLogs = get().currentSessionLogs;
            set({ currentSessionLogs: currentLogs.filter(l => l.log_sequence !== logSequence) });
        } catch (error) {
            console.error('Failed to delete session log:', error);
        }
    },

    // Templates
    templates: [],
    fetchTemplates: async (searchParams) => {
        try {
            let url = `${API_URL}/api/v1/prompt-templates/`;
            if (searchParams) {
                const params = new URLSearchParams();
                if (searchParams.templateName) params.append('template_name', searchParams.templateName);
                if (searchParams.creatorName) params.append('creator_user_name', searchParams.creatorName);
                url = `${API_URL}/api/v1/prompt-templates/search?${params.toString()}`;
            }
            const response = await axios.get(url);
            set({ templates: response.data });
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        }
    },
    createTemplate: async (template) => {
        try {
            await axios.post(`${API_URL}/api/v1/prompt-templates/`, template);
            get().fetchTemplates();
        } catch (error) {
            console.error('Failed to create template:', error);
        }
    },
    deleteTemplate: async (templateId) => {
        try {
            await axios.delete(`${API_URL}/api/v1/prompt-templates/${templateId}`);
            get().fetchTemplates();
        } catch (error) {
            console.error('Failed to delete template:', error);
        }
    },

    // Models
    models: [],
    fetchModels: async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/models/`);
            set({ models: response.data });
        } catch (error) {
            console.error('Failed to fetch models:', error);
        }
    },
    createModel: async (model) => {
        try {
            await axios.post(`${API_URL}/api/v1/models/`, model);
            get().fetchModels();
        } catch (error) {
            console.error('Failed to create model:', error);
        }
    },
    updateModel: async (modelId, model) => {
        try {
            await axios.put(`${API_URL}/api/v1/models/${modelId}`, model);
            get().fetchModels();
        } catch (error) {
            console.error('Failed to update model:', error);
        }
    },
    deleteModel: async (modelId) => {
        try {
            await axios.delete(`${API_URL}/api/v1/models/${modelId}`);
            get().fetchModels();
        } catch (error) {
            console.error('Failed to delete model:', error);
        }
    },

    // Deployments
    currentDeployments: [],
    fetchDeploymentsByModel: async (modelId) => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/deployments/model/${modelId}`);
            set({ currentDeployments: response.data });
        } catch (error) {
            console.error('Failed to fetch deployments:', error);
        }
    },
    createDeployment: async (deployment) => {
        try {
            await axios.post(`${API_URL}/api/v1/deployments`, deployment);
            if (deployment.model_id) get().fetchDeploymentsByModel(deployment.model_id);
        } catch (error) {
            console.error('Failed to create deployment:', error);
        }
    },
    updateDeployment: async (deploymentId, deployment) => {
        try {
            await axios.put(`${API_URL}/api/v1/deployments/${deploymentId}`, deployment);
        } catch (error) {
            console.error('Failed to update deployment:', error);
        }
    },
    deleteDeployment: async (deploymentId) => {
        try {
            await axios.delete(`${API_URL}/api/v1/deployments/${deploymentId}`);
            // Caller needs to refresh
        } catch (error) {
            console.error('Failed to delete deployment:', error);
        }
    },

    // Datasets
    datasets: [],
    fetchDatasets: async (searchParams) => {
        try {
            let url = `${API_URL}/api/v1/datasets/search`;
            const params = new URLSearchParams();
            if (searchParams?.datasetName) params.append('dataset_name', searchParams.datasetName);
            if (searchParams?.learningType) params.append('learning_type', searchParams.learningType);

            // If no search params, use get all
            if (!searchParams?.datasetName && !searchParams?.learningType) {
                url = `${API_URL}/api/v1/datasets/`;
            } else {
                url = `${API_URL}/api/v1/datasets/search?${params.toString()}`;
            }

            const response = await axios.get(url);
            set({ datasets: response.data });
        } catch (error) {
            console.error('Failed to fetch datasets:', error);
        }
    },
    createDataset: async (dataset) => {
        try {
            await axios.post(`${API_URL}/api/v1/datasets/`, dataset);
            get().fetchDatasets();
        } catch (error) {
            console.error('Failed to create dataset:', error);
        }
    },
    updateDataset: async (datasetId, dataset) => {
        try {
            await axios.put(`${API_URL}/api/v1/datasets/${datasetId}`, dataset);
            get().fetchDatasets();
        } catch (error) {
            console.error('Failed to update dataset:', error);
        }
    },
    deleteDataset: async (datasetId) => {
        try {
            await axios.delete(`${API_URL}/api/v1/datasets/${datasetId}`);
            get().fetchDatasets();
        } catch (error) {
            console.error('Failed to delete dataset:', error);
        }
    },
}));
