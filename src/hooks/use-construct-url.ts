import { getUrl } from 'aws-amplify/storage';
import { useEffect, useState } from 'react';

export function useConstructUrl(path: string) {
    const [objectUrl, setObjectUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        let isMounted = true;
        if (path) {
            getUrl({ path })
                .then((result) => {
                    if (isMounted) {
                        setObjectUrl(result.url.toString());
                    }
                })
                .catch((err: unknown) => {
                    console.error("Error fetching image from storage:", err);
                    setObjectUrl(undefined);
                });
        } else {
            setObjectUrl(undefined);
        }
        return () => {
            isMounted = false;
        };
    }, [path]);
    console.log("Constructed URL:", objectUrl);
    return objectUrl;
}
