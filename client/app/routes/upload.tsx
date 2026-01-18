import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect, unstable_parseMultipartFormData, unstable_createMemoryUploadHandler } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useState, useCallback } from "react";
import { Layout } from "~/components/Layout/Layout";
import { requireUserSession } from "~/services/auth.server";

// Define the action data shape for proper typing
type ActionData = {
    errors?: {
        video?: string;
        title?: string;
        description?: string;
        category?: string;
        form?: string;
    } | null;
    success?: boolean;
    message?: string;
};

export const meta: MetaFunction = () => {
    return [{ title: "Upload Video - LokDarpan" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
    const userSession = await requireUserSession(request);
    return json({ user: userSession.user });
}

export async function action({ request }: ActionFunctionArgs) {
    const userSession = await requireUserSession(request);

    try {
        const uploadHandler = unstable_createMemoryUploadHandler({
            maxPartSize: 500 * 1024 * 1024, // 500MB
        });

        const formData = await unstable_parseMultipartFormData(request, uploadHandler);

        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const category = formData.get("category") as string;
        const tags = formData.get("tags") as string;
        const video = formData.get("video") as File;

        // Validation
        const errors: ActionData["errors"] = {};
        if (!title || title.length < 1) errors.title = "Title is required";
        if (!description) errors.description = "Description is required";
        if (!category) errors.category = "Category is required";
        if (!video || video.size === 0) errors.video = "Please select a video file";

        if (Object.keys(errors!).length > 0) {
            return json<ActionData>({ errors, success: false }, { status: 400 });
        }

        // TODO: Call API to upload video
        // const apiFormData = new FormData();
        // apiFormData.append("title", title);
        // apiFormData.append("description", description);
        // apiFormData.append("category", category);
        // apiFormData.append("tags", tags);
        // apiFormData.append("video", video);
        // const response = await videoApi.upload(apiFormData, userSession.token);

        // For now, simulate success
        return json<ActionData>({ errors: null, success: true, message: "Video uploaded successfully!" });
    } catch (error) {
        return json<ActionData>(
            { errors: { form: "Failed to upload video. Please try again." }, success: false },
            { status: 500 }
        );
    }
}

const categories = [
    "Entertainment",
    "Education",
    "Gaming",
    "Music",
    "Sports",
    "Technology",
    "News",
    "Comedy",
    "Film",
    "Other",
];

export default function Upload() {
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith("video/")) {
                setSelectedFile(file);
            }
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <Layout user={null}>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-2">Upload Video</h1>
                <p className="text-gray-400 mb-8">Share your content with the world</p>

                {/* Success message */}
                {actionData?.success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-green-400 font-medium">Video uploaded successfully!</p>
                        </div>
                    </div>
                )}

                {/* Error message */}
                {actionData?.errors?.form && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-400">{actionData.errors.form}</p>
                    </div>
                )}

                <Form method="post" encType="multipart/form-data" className="space-y-6">
                    {/* Drag and drop zone */}
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${dragActive
                            ? "border-primary-500 bg-primary-500/10"
                            : selectedFile
                                ? "border-green-500 bg-green-500/5"
                                : "border-dark-700 hover:border-dark-600"
                            }`}
                    >
                        <input
                            type="file"
                            name="video"
                            accept="video/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />

                        {selectedFile ? (
                            <div className="space-y-3">
                                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-medium">{selectedFile.name}</p>
                                    <p className="text-sm text-gray-400">{formatFileSize(selectedFile.size)}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedFile(null)}
                                    className="text-sm text-primary-400 hover:text-primary-300"
                                >
                                    Choose different file
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="w-20 h-20 mx-auto rounded-full bg-dark-800 flex items-center justify-center">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-medium">Drag and drop your video here</p>
                                    <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                                </div>
                                <p className="text-xs text-gray-500">MP4, WebM, or MOV • Max 500MB</p>
                            </div>
                        )}
                    </div>
                    {actionData?.errors?.video && (
                        <p className="text-sm text-red-400">{actionData.errors.video}</p>
                    )}

                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                            Title <span className="text-primary-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            className="input"
                            placeholder="Add a title that describes your video"
                            maxLength={200}
                        />
                        {actionData?.errors?.title && (
                            <p className="mt-1 text-sm text-red-400">{actionData.errors.title}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                            Description <span className="text-primary-500">*</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={5}
                            className="input resize-none"
                            placeholder="Tell viewers about your video"
                            maxLength={5000}
                        />
                        {actionData?.errors?.description && (
                            <p className="mt-1 text-sm text-red-400">{actionData.errors.description}</p>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                            Category <span className="text-primary-500">*</span>
                        </label>
                        <select
                            id="category"
                            name="category"
                            className="input"
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        {actionData?.errors?.category && (
                            <p className="mt-1 text-sm text-red-400">{actionData.errors.category}</p>
                        )}
                    </div>

                    {/* Tags */}
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
                            Tags
                        </label>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            className="input"
                            placeholder="Add tags separated by commas (e.g., tutorial, coding, web)"
                        />
                        <p className="mt-1 text-xs text-gray-500">Tags help people find your video</p>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-end gap-4 pt-4">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !selectedFile}
                            className="btn-primary px-8"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Uploading...
                                </span>
                            ) : (
                                "Upload"
                            )}
                        </button>
                    </div>
                </Form>
            </div>
        </Layout>
    );
}
