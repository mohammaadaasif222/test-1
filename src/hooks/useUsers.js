import axios from "axios";
import { useState, useEffect, useCallback, useMemo } from "react";

export function useUsers({ query }) {
    const [users, setUsers] = useState([])
    const [loading, setLoding] = useState(false)
    const [error, setError] = useState(null)
    const [totalUsers, setToatalUsers] = useState(0)
    const [filterdUsers, setFilteredUsers] = useState([])

    const fetchUsers = useCallback(async () => {
        setLoding(true)
        try {
            const data = await axios.get(`https://api.github.com/search/users?q=Xe&page=1&per_page=30`)
            setUsers(data.data.items)

            setToatalUsers(data.data.total_count)
            setLoding(false)
        } catch (error) {
            console.log(error)
            setError(error)
            setLoding(false)
        }
    }, [])

    useEffect(() => {
        fetchUsers()
    }, [])

    const filterdUser = useMemo(() => {
        return filterd = users.filter((user) => user.login.toLowerCase().includes(query.toLowerCase()))
    }, [users, query])

    useEffect(() => {
        const id = setTimeout(() => {
            const filterd = users.filter((user) => user.login.toLowerCase().includes(query.toLowerCase()))
            setFilteredUsers(filterd)
        }, [1000])

        return () => {
            clearTimeout(id)
        }
    }, [query])


    return {
        users: filterdUsers && query ? filterdUsers : users, loading, error, totalUsers
    }

}