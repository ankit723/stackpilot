'use client'
import { useEffect, useState } from 'react';
import { getTags, createTag, updateTag, deleteTag } from '../../../actions/admin/tag/tags';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { TrashIcon, PencilIcon } from 'lucide-react';

type Tag = {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
};

export default function TagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newTagName, setNewTagName] = useState('');
    const [editingTagId, setEditingTagId] = useState<string | null>(null);
    const [editingTagName, setEditingTagName] = useState('');
    const [deletingTagId, setDeletingTagId] = useState<string | null>(null);

    useEffect(() => {
        const fetchTags = async () => {
            setLoading(true);
            const response = await getTags();
            if (response.error) {
                setError(response.error);
            } else {
                setTags(response.tags?.filter((tag): tag is Tag => !!tag) ?? []);
            }
            setLoading(false);
        };
        fetchTags();
    }, []);

    const handleCreateTag = async () => {
        if (!newTagName) return;
        const response = await createTag(newTagName, newTagName.toLowerCase().replace(/\s+/g, '-'));
        if (response.error) {
            setError(response.error);
        } else if (response.tag) {
            setTags([...tags, response.tag]);
            setNewTagName('');
        }
    };

    const handleEditTag = async (id: string) => {
        if (!editingTagName) return;
        const response = await updateTag(id, editingTagName, editingTagName.toLowerCase().replace(/\s+/g, '-'));
        if (response.error) {
            setError(response.error);
        } else if (response.tag) {
            setTags(tags.map(tag => (tag.id === id ? response.tag : tag)));
            setEditingTagId(null);
            setEditingTagName('');
        }
    };

    const handleDeleteTag = async (id: string) => {
        const response = await deleteTag(id);
        if (response.error) {
            setError(response.error);
        } else {
            setTags(tags.filter(tag => tag.id !== id));
        }
        setDeletingTagId(null);
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-6">Manage Tags</h1>
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Create New Tag</CardTitle>
                    <CardDescription>Add a new tag to be used for products.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                            value={newTagName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTagName(e.target.value)}
                            placeholder="Enter new tag name"
                            className="flex-grow"
                        />
                        <Button onClick={handleCreateTag} className="w-full sm:w-auto">Create Tag</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Tags</CardTitle>
                    <CardDescription>Here you can edit and delete existing tags.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <p>Loading tags...</p>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-center h-40 flex justify-center items-center">
                            <p>Error: {error}</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="hidden md:table-cell">Slug</TableHead>
                                    <TableHead className="hidden lg:table-cell">Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tags.map(tag => (
                                    <TableRow key={tag.id}>
                                        <TableCell className="font-medium">{tag.name}</TableCell>
                                        <TableCell className="hidden md:table-cell">{tag.slug}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{new Date(tag.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="icon" onClick={() => { setEditingTagId(tag.id); setEditingTagName(tag.name); }}>
                                                    <PencilIcon className="h-4 w-4" />
                                                </Button>
                                                <Button variant="destructive" size="icon" onClick={() => setDeletingTagId(tag.id)}>
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Edit Tag Dialog */}
            <Dialog open={editingTagId !== null} onOpenChange={(isOpen) => !isOpen && setEditingTagId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Tag</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input
                            value={editingTagName}
                            onChange={(e) => setEditingTagName(e.target.value)}
                            placeholder="Tag Name"
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={() => handleEditTag(editingTagId!)}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Tag Confirmation Dialog */}
            <Dialog open={deletingTagId !== null} onOpenChange={(isOpen) => !isOpen && setDeletingTagId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                    </DialogHeader>
                    <p>This action cannot be undone. This will permanently delete the tag.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingTagId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => handleDeleteTag(deletingTagId!)}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}