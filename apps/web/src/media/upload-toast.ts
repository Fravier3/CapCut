import { toast } from "sonner";

export interface MediaUploadToastResult {
	uploadedCount: number;
	assetNames?: string[];
}

function getAssetLabel({ count }: { count: number }): string {
	return count === 1 ? "media asset" : "media assets";
}

function waitForNextPaint(): Promise<void> {
	return new Promise((resolve) => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => resolve());
		});
	});
}

export async function showMediaUploadToast<T extends MediaUploadToastResult>({
	filesCount,
	promise,
}: {
	filesCount: number;
	promise: Promise<T> | (() => Promise<T>);
}) {
	const run = typeof promise === "function" ? promise : () => promise;
	const toastPromise = toast.promise(async () => {
		await waitForNextPaint();
		const result = await run();
		if (result.uploadedCount < 1) throw new Error("No se importó ningún archivo");
		return result;
	}, {
		loading: `Importando ${filesCount === 1 ? "archivo" : "archivos"}…`,
		success: ({ uploadedCount, assetNames }) => {
			if (uploadedCount === 1) {
				const assetName = assetNames?.[0];
				return assetName
					? `${assetName} se importó correctamente`
					: "Archivo importado correctamente";
			}

			if (uploadedCount > 1) {
				return `${uploadedCount} archivos importados correctamente`;
			}

			return "No media assets were uploaded";
		},
		error: (error) => error instanceof Error ? error.message : "No se pudo importar el archivo",
	});

	return toastPromise.unwrap();
}
