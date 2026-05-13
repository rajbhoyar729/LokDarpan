import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useNavigation, Link } from "@remix-run/react";
import { useState, useCallback, type FormEvent } from "react";
import { Layout } from "~/components/Layout/Layout";
import { requireUserSession } from "~/services/auth.server";
import { putVideoToPresignedUrl, videoApi } from "~/lib/api";

export const meta: MetaFunction = () => {
    return [{ title: "Upload Video - LokDarpan" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
    const userSession = await requireUserSession(request);
    return json({ user: userSession.user, token: userSession.token });
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
    const { user, token } = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const isNavigating = navigation.state === "submitting";

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successId, setSuccessId] = useState<string | null>(null);
    const [phase, setPhase] = useState<string | null>(null);

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

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccessId(null);
        if (!selectedFile) {
            setError("Please select a video file.");
            return;
        }

        const form = e.currentTarget;
        const title = (form.elements.namedItem("title") as HTMLInputElement).value.trim();
        const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value.trim();
        const category = (form.elements.namedItem("category") as HTMLSelectElement).value;
        const tags = (form.elements.namedItem("tags") as HTMLInputElement).value.trim();

        if (!title) {
            setError("Title is required.");
            return;
        }
        if (!description) {
            setError("Description is required.");
            return;
        }
        if (!category) {
            setError("Category is required.");
            return;
        }

        setBusy(true);
        try {
            setPhase("Creating upload…");
            const init = await videoApi.initiateUpload(
                { title, description, category, tags: tags || undefined },
                token
            );
            if (init.error || !init.data) {
                throw new Error(init.error || "Could not start upload");
            }

            const { videoId, preSignedUrl } = init.data;

            setPhase("Uploading to storage…");
            const put = await putVideoToPresignedUrl(preSignedUrl, selectedFile);
            if (!put.ok) {
                throw new Error(put.error);
            }

            setPhase("Starting transcoding…");
            const done = await videoApi.completeUpload(videoId, token);
            if (done.error || !done.data) {
                throw new Error(done.error || "Could not complete upload");
            }

            setPhase("Processing video (multi-quality HLS)…");
            for (let i = 0; i < 180; i++) {
                await new Promise(r => setTimeout(r, 2000));
                const st = await videoApi.getTranscodeStatus(videoId, token);
                if (st.data?.videoStatus === "COMPLETED") {
                    setSuccessId(videoId);
                    setPhase(null);
                    setBusy(false);
                    return;
                }
                if (st.data?.videoStatus === "FAILED") {
                    throw new Error(st.data.processingError || "Transcode failed");
                }
            }
            setSuccessId(videoId);
            setPhase("Still processing — you can open the watch page and refresh.");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Upload failed");
            setPhase(null);
        } finally {
            setBusy(false);
        }
    }

    return (
        <Layout user={user}>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-2">Upload Video</h1>
                <p className="text-gray-400 mb-8">Direct-to-S3 upload, then multi-quality transcoding (144p–1080p HLS)</p>

                {successId && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <p className="text-green-400 font-medium mb-2">Upload pipeline finished.</p>
                        <Link to={`/watch/${successId}`} className="text-primary-400 hover:underline">
                            Open video
                        </Link>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {phase && (
                    <div className="mb-6 p-4 bg-dark-800 border border-dark-600 rounded-xl text-gray-300 text-sm">
                        {phase}
                    </div>
                )}

                <Form method="post" encType="multipart/form-data" className="space-y-6" onSubmit={onSubmit}>
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

                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                            Title <span className="text-primary-500">*</span>
                        </label>
                        <input type="text" id="title" name="title" className="input" placeholder="Title" maxLength={200} />
                    </div>

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
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                            Category <span className="text-primary-500">*</span>
                        </label>
                        <select id="category" name="category" className="input" defaultValue="">
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
                            Tags
                        </label>
                        <input type="text" id="tags" name="tags" className="input" placeholder="comma, separated" />
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-4">
                        <button type="button" className="btn-secondary" onClick={() => window.history.back()}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={busy || isNavigating || !selectedFile}
                            className="btn-primary px-8"
                        >
                            {busy ? "Working…" : "Upload"}
                        </button>
                    </div>
                </Form>
            </div>
        </Layout>
    );
}
